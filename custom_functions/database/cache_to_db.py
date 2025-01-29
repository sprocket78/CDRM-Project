import sqlite3
import os

def create_database():
    conn = sqlite3.connect(f'{os.getcwd()}/databases/sql/key_cache.db')
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS licenses (
        SERVICE TEXT,
        PSSH TEXT,
        KID TEXT PRIMARY KEY,
        Key TEXT,
        License_URL TEXT,
        Headers TEXT,
        Cookies TEXT,
        Data TEXT
    )
    ''')
    conn.commit()
    conn.close()

def cache_to_db(service: str = None, pssh: str = None, kid: str = None, key: str = None, license_url: str = None, headers: str = None, cookies: str = None, data: str = None):
    create_database()
    conn = sqlite3.connect(f'{os.getcwd()}/databases/sql/key_cache.db')
    cursor = conn.cursor()

    # Check if the record with the given KID already exists
    cursor.execute('''SELECT 1 FROM licenses WHERE KID = ?''', (kid,))
    existing_record = cursor.fetchone()

    # Insert or replace the record
    cursor.execute('''
    INSERT OR REPLACE INTO licenses (SERVICE, PSSH, KID, Key, License_URL, Headers, Cookies, Data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (service, pssh, kid, key, license_url, headers, cookies, data))

    conn.commit()
    conn.close()

    # Return whether the record was "added" or "updated"
    if existing_record:
        return True
    else:
        return False

def search_by_pssh_or_kid(search_filter):
    # Connect to the database
    conn = sqlite3.connect(f'{os.getcwd()}/databases/sql/key_cache.db')
    cursor = conn.cursor()

    # Initialize a set to store unique matching records (use a set to avoid duplicates)
    results = set()

    # Search for records where PSSH contains the search_filter
    cursor.execute('''
    SELECT * FROM licenses WHERE PSSH LIKE ?
    ''', ('%' + search_filter + '%',))  # '%' wildcards for partial matching
    rows = cursor.fetchall()
    for row in rows:
        # Add the relevant fields to the set (will automatically handle duplicates)
        results.add((row[1], row[2], row[3]))  # (PSSH, KID, Key)

    # Search for records where KID contains the search_filter
    cursor.execute('''
    SELECT * FROM licenses WHERE KID LIKE ?
    ''', ('%' + search_filter + '%',))  # '%' wildcards for partial matching
    rows = cursor.fetchall()
    for row in rows:
        # Add the relevant fields to the set (will automatically handle duplicates)
        results.add((row[1], row[2], row[3]))  # (PSSH, KID, Key)

    # Convert the set of results to a list of dictionaries for output
    final_results = [{'PSSH': result[0], 'KID': result[1], 'Key': result[2]} for result in results]

    conn.close()

    return final_results[:20]

def get_key_by_kid_and_service(kid, service):
    # Using 'with' to automatically close the connection when done
    with sqlite3.connect(f'{os.getcwd()}/databases/sql/key_cache.db') as conn:
        cursor = conn.cursor()

        # Query to search by KID and SERVICE
        cursor.execute('''
        SELECT Key FROM licenses WHERE KID = ? AND SERVICE = ?
        ''', (kid, service))

        # Fetch the result
        result = cursor.fetchone()

        # Check if a result was found
        if result:
            return result[0]  # The 'Key' is the first (and only) column returned in the result
        else:
            return None  # No matching record found

def get_kid_key_dict(service_name):
    # Connect to the database
    conn = sqlite3.connect(f'{os.getcwd()}/databases/sql/key_cache.db')
    cursor = conn.cursor()

    # Query to fetch KID and Key for the selected service
    cursor.execute('''
    SELECT KID, Key FROM licenses WHERE SERVICE = ?
    ''', (service_name,))

    # Fetch all results and create the dictionary
    kid_key_dict = {row[0]: row[1] for row in cursor.fetchall()}

    conn.close()

    return kid_key_dict


def get_unique_services():
    conn = sqlite3.connect(f'{os.getcwd()}/databases/sql/key_cache.db')
    cursor = conn.cursor()

    # Query to get distinct services from the 'licenses' table
    cursor.execute('SELECT DISTINCT SERVICE FROM licenses')

    # Fetch all results and extract the unique services
    services = cursor.fetchall()

    # Extract the service names from the tuple list
    unique_services = [service[0] for service in services]

    conn.close()
    return unique_services


def key_count():
    conn = sqlite3.connect(f'{os.getcwd()}/databases/sql/key_cache.db')
    cursor = conn.cursor()

    # Count the number of KID entries in the licenses table
    cursor.execute('SELECT COUNT(KID) FROM licenses')
    count = cursor.fetchone()[0]  # Fetch the result and get the count

    conn.close()

    return count


