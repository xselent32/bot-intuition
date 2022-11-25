const { Client } = require('pg'); 

const client = new Client({
    user: 'gen_user',
    host: '83.222.10.189',
    database: 'default_db',
    password: 'png4oh0z45',
    port: 5432,
});

const testConnect = client.connect();
console.log(testConnect)