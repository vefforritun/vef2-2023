/* eslint-disable no-unused-vars */
/*
Keyrt með:
node 02.sql-injection.js

Keyrir upp express þjón með:

* Formi á / til að skrá nemenda
* Lista af nemendum á /students
* Upplýsingar um hvern nemenda á /students/:id

Búa þarf til students töflu sem er í `schema.sql`

Föllin `insert()` og `selectById()` bjóða bæði upp á SQL injection. Til að sjá:

Skrá einhverja nemendur
Skrá nemenda sem heitir `Robert'); DROP TABLE students;--"`, öllu verður eytt
úr töflu

Útbúa töflu upp á nýtt
Skrá einhverja nemendur
Uppfæra einhverja nemendur sem "útskrifaða" með t.d.
UPDATE students SET graduated=true WHERE id=1;
Þessir nemendur ættu ekki að sjást í viðmóti
Opna stakan nemenda og breyta id í query streng í
1 OR 1=1 ORDER BY id
Þá sést nemandi með id=1 sem er útskrifaður og ætti ekki að sjást
*/

import pg from 'pg';
import express from 'express';
import xss from 'xss';

const connectionString = 'postgres://vef2-user:123@localhost/vef2-sql';
const pool = new pg.Pool({ connectionString });

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`
    <h2>Skrá nemenda</h2>
    <form method="post" action="/post">
      <input type="text" name="data">
      <button>Senda</button>
    </form>
    <p><a href="/students ">Skoða nemendur</a></p>
  `);
});

async function insert(data) {
  const client = await pool.connect();

  try {
    // EKKI HERMA! SQL INJECTION!!
    await client.query(`INSERT INTO students(name) VALUES('${data}')`);
  } catch (e) {
    console.error('Error', e);
  } finally {
    client.release();
  }
}

async function insertSafe(data) {
  const client = await pool.connect();

  try {
    // Lagað, notum parameterized input
    await client.query('INSERT INTO students(name) VALUES($1)', [data]);
  } catch (e) {
    console.error('Error', e);
  } finally {
    client.release();
  }
}

async function select() {
  const client = await pool.connect();

  try {
    const res = await client.query(
      'SELECT * FROM students WHERE graduated = false',
    );
    return res.rows;
  } catch (e) {
    console.error('Error', e);
  } finally {
    client.release();
  }

  return [];
}

async function selectById(id) {
  const client = await pool.connect();

  try {
    // EKKI HERMA! SQL INJECTION!!
    const res = await client.query(
      `SELECT * FROM students WHERE graduated = false AND id = ${id}`,
    );
    return res.rows;
  } catch (e) {
    console.error('Error', e);
  } finally {
    client.release();
  }

  return [];
}

async function selectByIdSafe(id) {
  const client = await pool.connect();

  try {
    // Lagað, notum parameterized input
    const res = await client.query(
      'SELECT * FROM students WHERE graduated = false AND id = $1',
      [id],
    );
    return res.rows;
  } catch (e) {
    console.error('Error', e);
  } finally {
    client.release();
  }

  return [];
}

app.get('/student', async (req, res) => {
  const { id } = req.query;

  const student = await selectById(id);

  if (student.length === 0) {
    res.send('Engin nemandi');
  }

  const [{
    name,
    date,
  }] = student;

  res.send(`
    <h2>Nemandi</h2>
    <p>Nafn: ${name}</p>
    <p>Skráning: ${date}</p>
  `);
});

app.get('/students', async (req, res) => {
  const students = await select();

  const output = students
    .map((s) => `<a href="/student?id=${s.id}">${s.name}</a>`)
    .join('</li><li>');

  res.send(`
  <ul>
    <li>${output}</li>
  </ul>`);
});

app.post('/post', async (req, res) => {
  const { data } = req.body;

  // XSS möguleiki! nota xss() utanum data til að verjast
  await insert(data);

  res.send(`
    <p>Nemandi skráður.</p>
    <p><a href="/">Skrá annan</a></p>
    <p><a href="/students">Skoða nemendur</a></p>
  `);
});

app.listen(3000, () => {
  console.info('Server running at http://localhost:3000/');
});
