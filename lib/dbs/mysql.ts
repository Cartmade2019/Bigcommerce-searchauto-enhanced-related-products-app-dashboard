import mysql, { PoolOptions } from 'mysql2';
import { promisify } from 'util';
import { SessionProps, StoreData } from '../../types';

const MYSQL_CONFIG: PoolOptions = {
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    ...(process.env.MYSQL_PORT && { port: Number(process.env.MYSQL_PORT) }),
};

// For use with DB URLs
// Other mysql: https://www.npmjs.com/package/mysql#pooling-connections
const dbUrl = process.env.DATABASE_URL;
const pool = dbUrl ? mysql.createPool(dbUrl) : mysql.createPool(MYSQL_CONFIG);
const query = promisify(pool.query.bind(pool));

// Use setUser for storing global user data (persists between installs)
export async function setUser({ user }: SessionProps) {
    if (!user) return null;

    const { email, id, username } = user;
    const userData = { email, userId: id, username };

    await query('REPLACE INTO users SET ?', userData);
}

export async function setStore(session: SessionProps) {
    const { access_token: accessToken, context, scope } = session;
    // Only set on app install or update
    if (!accessToken || !scope) return null;

    const storeHash = context?.split('/')[1] || '';
    const storeData: StoreData = { accessToken, scope, storeHash };

    // await query('REPLACE INTO stores SET ?', storeData);
    // Run the query and get the inserted or updated ID
    // const result = await query('REPLACE INTO stores SET ?', storeData);
    // const storeId = result.insertId || result.id;
    // Disable foreign key checks
    await query('SET FOREIGN_KEY_CHECKS = 0');

    // Run the REPLACE INTO query
    const result = await query('REPLACE INTO stores SET ?', storeData);
    const storeId = result.insertId || result.id;

    // Re-enable foreign key checks
    await query('SET FOREIGN_KEY_CHECKS = 1');

    if (storeId) {
        await createStoreData(storeId, storeHash);
        await createScriptURL(storeId, storeHash, accessToken)
    }
}

// custom
// update the store data table with store data
async function createStoreData(store_id: number, storeHash: string) {
    const storeData = {
        store_id,
        heading: 'Your Heading',
        sub_heading: 'Your Sub Heading',
        csv_url: 'https://search-auto-related-app-backend-ly5px.ondigitalocean.app/uploads/example-file.xlsx',
        storeUrl: `https://store-${storeHash}.mybigcommerce.com`
    };

    await query('INSERT INTO storeData SET ?', storeData);
}

// create a script URL on first install
async function createScriptURL(storeId: number, storeHash: string, accessToken: string) {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("X-Auth-Token", accessToken);

    const raw = JSON.stringify({
        "name": "Searchauto enhanced related products",
        "description": "The realted products will be displayed on the PDP based on the CSV upladed.",
        "html": "<script defer src='https://search-auto-related-app-backend-ly5px.ondigitalocean.app/api/related-products/products?sku={{ product.sku }}&storeId=" + storeId + "&storefront_api={{ settings.storefront_api.token }}'></script>",
        "auto_uninstall": true,
        "load_method": "default",
        "location": "footer",
        "visibility": "storefront",
        "kind": "script_tag",
        "consent_category": "essential"
    });

    const requestOptions: RequestInit = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch(`https://api.bigcommerce.com/stores/${storeHash}/v3/content/scripts`, requestOptions);
        const result = await response.text();
        console.log(result);
    } catch (error) {
        console.error(error);
    }
}

// custom


// Use setStoreUser for storing store specific variables
export async function setStoreUser(session: SessionProps) {
    const { access_token: accessToken, context, owner, sub, user: { id: userId } } = session;
    if (!userId) return null;

    const contextString = context ?? sub;
    const storeHash = contextString?.split('/')[1] || '';
    const sql = 'SELECT * FROM storeUsers WHERE userId = ? AND storeHash = ?';
    const values = [String(userId), storeHash];
    const storeUser = await query(sql, values);

    // Set admin (store owner) if installing/ updating the app
    // https://developer.bigcommerce.com/api-docs/apps/guide/users
    if (accessToken) {
        // Create a new admin user if none exists
        if (!storeUser.length) {
            await query('INSERT INTO storeUsers SET ?', { isAdmin: true, storeHash, userId });
        } else if (!storeUser[0]?.isAdmin) {
            await query('UPDATE storeUsers SET isAdmin=1 WHERE userId = ? AND storeHash = ?', values);
        }
    } else {
        // Create a new user if it doesn't exist (non-store owners added here for multi-user apps)
        if (!storeUser.length) {
            await query('INSERT INTO storeUsers SET ?', { isAdmin: owner.id === userId, storeHash, userId });
        }
    }
}

export async function deleteUser({ context, user, sub }: SessionProps) {
    const contextString = context ?? sub;
    const storeHash = contextString?.split('/')[1] || '';
    const values = [String(user?.id), storeHash];
    await query('DELETE FROM storeUsers WHERE userId = ? AND storeHash = ?', values);
}

export async function hasStoreUser(storeHash: string, userId: string) {
    if (!storeHash || !userId) return false;

    const values = [userId, storeHash];
    const results = await query('SELECT * FROM storeUsers WHERE userId = ? AND storeHash = ? LIMIT 1', values);

    return results.length > 0;
}

export async function getStoreToken(storeHash: string) {
    if (!storeHash) return null;

    const results = await query('SELECT accessToken FROM stores WHERE storeHash = ?', storeHash);

    return results.length ? results[0].accessToken : null;
}

export async function deleteStore({ store_hash: storeHash }: SessionProps) {
    const deleteStoreDataResult = await deleteStoreDataByStoreHash(storeHash);
    if(deleteStoreDataResult){
        await query('DELETE FROM stores WHERE storeHash = ?', storeHash);
    }
}


export async function getRelatedProductCSVData(store: number) {
    const results = await query('SELECT * FROM csvdata WHERE store = ?', store);
    return results;
}

export async function getStoreDataById(storeId: number) {
    const results = await query('SELECT * FROM storeData WHERE store_id = ?', storeId);
    return results;
}


export async function getStoreDataByStoreHash(storehash: string) {
    const results = await query(`
        SELECT searchautorelatedapp.storeData.*
        FROM searchautorelatedapp.storeData
        JOIN searchautorelatedapp.stores ON storeData.store_id = stores.id
        WHERE stores.storehash = ?
      `, [storehash]);
    return results;
}

export async function updateStoreDataById(storeId: any, updateData: { [key: string]: any }) {
    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const updateValues = Object.values(updateData);
    updateValues.push(storeId);
    const sql = `UPDATE storeData SET ${updateFields} WHERE store_id = ?`;
    const results = await query(sql, updateValues);
    return results;
}

export async function deleteStoreDataByStoreHash(storehash: string) {
    try {
        // Get store data by store hash
        const storeData = await getStoreDataByStoreHash(storehash);
        console.log("storeData", storeData)

        if (storeData.length === 0) {
            console.log('No store data found for the given store hash');
            return;
        }

        // Extract store_id from the first result (assuming all results have the same store_id)
        const storeId = storeData[0].store_id;

        // Delete store data
        const deleteResult = await query(`
            DELETE FROM storeData
            WHERE store_id = ?
        `, [storeId]);
        console.log(`Deleted ${deleteResult.affectedRows} rows from storeData`);
        return deleteResult;
    } catch (error) {
        console.error('Error deleting store data by store hash:', error);
        throw error; // Re-throw the error after logging it
    }
}




