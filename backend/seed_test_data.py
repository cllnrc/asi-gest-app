"""
Script per popolare database ASI_GEST con dati di test realistici
© 2025 Enrico Callegaro

Crea:
- ConfigCommessa per alcune commesse da ASITRON
- Fasi produttive (SMD, PTH, CONTROLLI)
- Lotti produzione (alcuni aperti, alcuni chiusi)
- Dati realistici per testare l'applicazione
"""

import pymssql
from datetime import datetime, timedelta
import random

# Database configuration
DB_CONFIG = {
    'server': '192.168.1.15',
    'user': 'sa',
    'password': 'Nde962005',
    'database': 'ASI_GEST',
    'port': 1433
}

def get_connection():
    """Crea connessione al database"""
    return pymssql.connect(**DB_CONFIG)

def get_asitron_commesse():
    """Recupera alcune commesse aperte da ASITRON"""
    conn = pymssql.connect(
        server='192.168.1.15',
        user='sa',
        password='Nde962005',
        database='ASITRON',
        port=1433
    )
    cursor = conn.cursor()

    # Get top 10 open commesse
    cursor.execute("""
        SELECT TOP 10
            PROGRESSIVO, ESERCIZIO, NUMEROCOM, RIFCOMMCLI, CODCLIENTE
        FROM TESTEORDINIPROD
        WHERE STATOCHIUSO = 0
        ORDER BY ESERCIZIO DESC, NUMEROCOM DESC
    """)

    commesse = cursor.fetchall()
    conn.close()
    return commesse

def get_fase_tipo_ids(conn):
    """Recupera IDs dei tipi fase"""
    cursor = conn.cursor()
    cursor.execute("SELECT FaseTipoID, Codice FROM FaseTipo")
    return {row[1]: row[0] for row in cursor.fetchall()}

def get_utente_ids(conn):
    """Recupera IDs utenti"""
    cursor = conn.cursor()
    cursor.execute("SELECT UtenteID, Username FROM Utenti WHERE Attivo = 1")
    return [row[0] for row in cursor.fetchall()]

def get_macchina_ids(conn, reparto):
    """Recupera IDs macchine per reparto"""
    cursor = conn.cursor()
    cursor.execute("SELECT MacchinaID FROM Macchine WHERE Reparto = %s AND Attiva = 1", (reparto,))
    return [row[0] for row in cursor.fetchall()]

def clear_existing_data(conn):
    """Cancella dati esistenti (mantiene seed data)"""
    cursor = conn.cursor()
    print("🗑️  Cancellazione dati esistenti...")

    cursor.execute("DELETE FROM LogEventi")
    cursor.execute("DELETE FROM DocumentiTecnici")
    cursor.execute("DELETE FROM Lotti")
    cursor.execute("DELETE FROM Fasi")
    cursor.execute("DELETE FROM ConfigCommessa")

    conn.commit()
    print("✅ Dati cancellati")

def create_config_commesse(conn, commesse_asitron):
    """Crea configurazioni per commesse"""
    cursor = conn.cursor()
    configs = []

    print("📋 Creazione ConfigCommessa...")

    for i, (progressivo, esercizio, numerocom, rifcommcli, codcliente) in enumerate(commesse_asitron):
        # Varia configurazioni
        flag_smd = 1
        flag_pth = random.choice([0, 1])
        flag_controlli = 1
        flag_terzista = random.choice([0, 0, 0, 1])  # Raro

        diba = f"DIBA-{esercizio}-{numerocom:03d}" if i < 5 else None
        revisione = random.choice(['A', 'B', 'C', None])
        bloccata_doc = 1 if i == 7 else 0  # Una bloccata per test

        cursor.execute("""
            INSERT INTO ConfigCommessa
                (CommessaERPId, FlagSMD, FlagPTH, FlagControlli, FlagTerzista,
                 DIBA, Revisione, BloccataDocumentazione, Note)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            progressivo, flag_smd, flag_pth, flag_controlli, flag_terzista,
            diba, revisione, bloccata_doc,
            f'Config test per commessa {esercizio}/{numerocom}'
        ))

        cursor.execute("SELECT @@IDENTITY")
        config_id = cursor.fetchone()[0]

        configs.append({
            'config_id': config_id,
            'commessa_erp_id': progressivo,
            'esercizio': esercizio,
            'numerocom': numerocom,
            'flag_smd': flag_smd,
            'flag_pth': flag_pth,
            'flag_controlli': flag_controlli,
        })

        print(f"   ✓ Config {config_id}: Commessa {esercizio}/{numerocom} - SMD:{flag_smd} PTH:{flag_pth} CTRL:{flag_controlli}")

    conn.commit()
    print(f"✅ {len(configs)} ConfigCommessa create\n")
    return configs

def create_fasi(conn, configs, fase_tipo_ids):
    """Crea fasi per ogni configurazione"""
    cursor = conn.cursor()
    fasi = []

    print("🔧 Creazione Fasi...")

    for config in configs:
        # Crea fasi in base ai flag
        fasi_da_creare = []

        if config['flag_smd']:
            fasi_da_creare.append(('SMD', random.randint(100, 500)))

        if config['flag_controlli'] and config['flag_smd']:
            fasi_da_creare.append(('CONTROLLI', random.randint(80, 450)))

        if config['flag_pth']:
            fasi_da_creare.append(('PTH', random.randint(50, 300)))

        for fase_tipo_cod, qta_prevista in fasi_da_creare:
            fase_tipo_id = fase_tipo_ids[fase_tipo_cod]

            # Alcune fasi completate, alcune in corso, alcune aperte
            rand = random.random()
            if rand < 0.3:  # 30% completate
                stato = 'CHIUSA'
            elif rand < 0.6:  # 30% in corso
                stato = 'IN_CORSO'
            else:  # 40% aperte
                stato = 'APERTA'

            data_apertura = datetime.now() - timedelta(days=random.randint(1, 15))
            data_chiusura = (datetime.now() - timedelta(days=random.randint(0, 5))) if stato == 'CHIUSA' else None

            cursor.execute("""
                INSERT INTO Fasi
                    (CommessaERPId, FaseTipoID, Stato, DataApertura, DataChiusura,
                     QtaPrevista, QtaProdotta, QtaResidua)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                config['commessa_erp_id'],
                fase_tipo_id,
                stato,
                data_apertura,
                data_chiusura,
                qta_prevista,
                qta_prevista if stato == 'CHIUSA' else int(qta_prevista * random.uniform(0.2, 0.8)),
                0 if stato == 'CHIUSA' else int(qta_prevista * random.uniform(0.2, 0.6))
            ))

            cursor.execute("SELECT @@IDENTITY")
            fase_id = cursor.fetchone()[0]

            fasi.append({
                'fase_id': fase_id,
                'config_id': config['config_id'],
                'commessa_erp_id': config['commessa_erp_id'],
                'fase_tipo_id': fase_tipo_id,
                'fase_tipo_cod': fase_tipo_cod,
                'stato': stato,
                'qta_prevista': qta_prevista,
            })

            print(f"   ✓ Fase {fase_id}: {fase_tipo_cod} per commessa {config['esercizio']}/{config['numerocom']} - {stato}")

    conn.commit()
    print(f"✅ {len(fasi)} Fasi create\n")
    return fasi

def create_lotti(conn, fasi, utenti_ids, macchine_smd, macchine_pth, macchine_ctrl):
    """Crea lotti per le fasi"""
    cursor = conn.cursor()
    lotti_count = 0

    print("📦 Creazione Lotti...")

    for fase in fasi:
        # Solo fasi IN_CORSO o CHIUSA hanno lotti
        if fase['stato'] == 'APERTA':
            continue

        # Numero lotti per fase
        num_lotti = random.randint(1, 4) if fase['stato'] == 'IN_CORSO' else random.randint(2, 5)

        # Macchine per reparto
        if fase['fase_tipo_cod'] == 'SMD':
            macchine = macchine_smd
        elif fase['fase_tipo_cod'] == 'PTH':
            macchine = macchine_pth
        else:  # CONTROLLI
            macchine = macchine_ctrl

        if not macchine:
            continue

        qta_totale = fase['qta_prevista']
        qta_per_lotto = qta_totale // num_lotti

        for i in range(num_lotti):
            progressivo = i + 1

            # Lotti più vecchi chiusi, ultimi potrebbero essere aperti
            is_ultimo = (i == num_lotti - 1)
            is_aperto = is_ultimo and fase['stato'] == 'IN_CORSO' and random.random() < 0.5

            data_inizio = datetime.now() - timedelta(days=random.randint(1, 10), hours=random.randint(0, 23))
            data_fine = None if is_aperto else data_inizio + timedelta(hours=random.randint(2, 8))

            qta_input = qta_per_lotto + random.randint(-10, 10)
            if is_aperto:
                qta_output = 0
                qta_scarti = 0
            else:
                # Resa tra 90% e 99%
                resa = random.uniform(0.90, 0.99)
                qta_output = int(qta_input * resa)
                qta_scarti = qta_input - qta_output

            utente_id = random.choice(utenti_ids)
            macchina_id = random.choice(macchine)

            programma_feeder = f"PRG_{fase['commessa_erp_id']}_{fase['fase_tipo_cod']}" if fase['fase_tipo_cod'] == 'SMD' else None
            tempo_setup = random.randint(15, 60) if not is_aperto else None

            tipo_scarto = random.choice(['SALDATURA', 'COMPONENTE_ERRATO', 'AOI_FAIL', None]) if qta_scarti > 0 else None
            note_scarti = f"Scarti: {tipo_scarto}" if qta_scarti > 5 else None

            cursor.execute("""
                INSERT INTO Lotti
                    (FaseID, Progressivo, DataInizio, DataFine, QtaInput, QtaOutput, QtaScarti,
                     OperatoreID, MacchinaID, ProgrammaFeeder, TempoSetupMin,
                     TipoScarto, NoteScarti, Note)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                fase['fase_id'],
                progressivo,
                data_inizio,
                data_fine,
                qta_input,
                qta_output,
                qta_scarti,
                utente_id,
                macchina_id,
                programma_feeder,
                tempo_setup,
                tipo_scarto,
                note_scarti,
                f"Lotto test {progressivo} - {'APERTO' if is_aperto else 'CHIUSO'}"
            ))

            lotti_count += 1

            status_emoji = "🟢" if is_aperto else "⚫"
            print(f"   {status_emoji} Lotto {progressivo}: Fase {fase['fase_id']} ({fase['fase_tipo_cod']}) - In:{qta_input} Out:{qta_output} Scarti:{qta_scarti}")

    conn.commit()
    print(f"✅ {lotti_count} Lotti creati\n")
    return lotti_count

def print_summary(conn):
    """Stampa sommario dati creati"""
    cursor = conn.cursor()

    print("\n" + "="*60)
    print("📊 SOMMARIO DATABASE ASI_GEST")
    print("="*60)

    # Count records
    cursor.execute("SELECT COUNT(*) FROM ConfigCommessa")
    config_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM Fasi")
    fasi_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM Fasi WHERE Stato = 'APERTA'")
    fasi_aperte = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM Fasi WHERE Stato = 'IN_CORSO'")
    fasi_in_corso = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM Fasi WHERE Stato = 'CHIUSA'")
    fasi_chiuse = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM Lotti")
    lotti_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM Lotti WHERE DataFine IS NULL")
    lotti_aperti = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM Lotti WHERE DataFine IS NOT NULL")
    lotti_chiusi = cursor.fetchone()[0]

    cursor.execute("""
        SELECT SUM(QtaOutput), SUM(QtaScarti)
        FROM Lotti
        WHERE DataFine IS NOT NULL
    """)
    row = cursor.fetchone()
    totale_output = row[0] or 0
    totale_scarti = row[1] or 0
    resa_media = (totale_output / (totale_output + totale_scarti) * 100) if (totale_output + totale_scarti) > 0 else 0

    print(f"\n📋 ConfigCommessa:        {config_count}")
    print(f"\n🔧 Fasi:                  {fasi_count}")
    print(f"   - APERTA:              {fasi_aperte}")
    print(f"   - IN_CORSO:            {fasi_in_corso}")
    print(f"   - CHIUSA:              {fasi_chiuse}")
    print(f"\n📦 Lotti:                 {lotti_count}")
    print(f"   - Aperti (in corso):   {lotti_aperti}")
    print(f"   - Chiusi (completati): {lotti_chiusi}")
    print(f"\n📊 Produzione:")
    print(f"   - Totale Output:       {totale_output:,} pezzi")
    print(f"   - Totale Scarti:       {totale_scarti:,} pezzi")
    print(f"   - Resa Media:          {resa_media:.2f}%")
    print("\n" + "="*60)
    print("✅ Database popolato con successo!")
    print("="*60 + "\n")

def main():
    """Main execution"""
    print("\n" + "="*60)
    print("🚀 SEED TEST DATA - ASI_GEST")
    print("="*60 + "\n")

    try:
        # Connect
        print("🔌 Connessione a database...")
        conn = get_connection()
        print("✅ Connesso\n")

        # Get ASITRON commesse
        print("📥 Recupero commesse da ASITRON...")
        commesse_asitron = get_asitron_commesse()
        print(f"✅ {len(commesse_asitron)} commesse recuperate\n")

        # Get reference data
        fase_tipo_ids = get_fase_tipo_ids(conn)
        utenti_ids = get_utente_ids(conn)
        macchine_smd = get_macchina_ids(conn, 'SMD')
        macchine_pth = get_macchina_ids(conn, 'PTH')
        macchine_ctrl = get_macchina_ids(conn, 'CONTROLLI')

        print(f"📚 Reference data:")
        print(f"   - FaseTipo: {len(fase_tipo_ids)}")
        print(f"   - Utenti: {len(utenti_ids)}")
        print(f"   - Macchine SMD: {len(macchine_smd)}")
        print(f"   - Macchine PTH: {len(macchine_pth)}")
        print(f"   - Macchine CTRL: {len(macchine_ctrl)}\n")

        # Clear existing
        clear_existing_data(conn)
        print()

        # Create data
        configs = create_config_commesse(conn, commesse_asitron)
        fasi = create_fasi(conn, configs, fase_tipo_ids)
        lotti_count = create_lotti(conn, fasi, utenti_ids, macchine_smd, macchine_pth, macchine_ctrl)

        # Summary
        print_summary(conn)

        conn.close()

    except Exception as e:
        print(f"\n❌ ERRORE: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == '__main__':
    exit(main())
