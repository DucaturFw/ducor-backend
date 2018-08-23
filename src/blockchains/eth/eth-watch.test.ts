import "jest-extended"
import r from "rethinkdb"
import {getConnection, getLastBlock, getOrCreateDatabase} from "./eth-watch";

describe('RethinkDB manipulations', () => {
    let conn: r.Connection | undefined,
        db: r.Db | undefined;
    const options = {
        rethinkHost: process.env.DUCOR_EOS_RETHINKHOST!,
        rethinkPort: parseInt(process.env.DUCOR_EOS_RETHINKPORT!),
        rethinkDB: process.env.DUCOR_EOS_RETHINKDATABASE!,
        rethinkTable: process.env.DUCOR_ETH_RETHINKTABLE!
    }

    it('should create similar contract', async () => {
        try {
            conn = await getConnection(options.rethinkHost, options.rethinkPort)
            db = await getOrCreateDatabase(options.rethinkDB, conn)
            expect(db && conn).toBeTruthy();
        } catch (err) {
            console.log('RethinkDB connection is broken, skipping.')
        }
    })

    it('should check last block of new table', async () => {
        if (db && conn) {
            const last = await getLastBlock(db, conn, 'new_table_wtf');
            expect(last).toEqual(0)
        } else {
            console.log('RethinkDB connection is broken, skipping.')
        }
    })

    it('should check last block of existing table', async () => {
        if (db && conn) {
            const tables = await db.tableList().run(conn)
            if (tables.indexOf(options.rethinkTable) === -1) {
                console.log('RethinkDB ETH table does not exist, skipping.')
            } else {
                const lastEthBlock = await getLastBlock(db, conn, options.rethinkTable);
                expect(lastEthBlock).toBeGreaterThan(0)
            }
        } else {
            console.log('RethinkDB connection is broken, skipping.')
        }
    })

})