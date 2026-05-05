import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API rodando 🚀');
});

app.get('/teste-db', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json(result.rows);
});

app.get('/usuarios', async (req, res) => {
  const result = await pool.query('SELECT * FROM usuarios');
  res.json(result.rows);
});

app.post('/usuarios', async (req, res) => {
  try {
    console.log('BODY RECEBIDO:', req.body); 

    const { nome, email, telefone, resumo } = req.body;

    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, telefone, resumo) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, email, telefone, resumo]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('ERRO:', error); 
    res.status(500).json({ erro: error.message });
  }
});


app.get('/usuarios/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: error.message });
  }
});

app.put('/usuarios/:id', async (req, res) => {
  const { nome, email, telefone, resumo } = req.body;

  const result = await pool.query(
    'UPDATE usuarios SET nome=$1, email=$2, telefone=$3, resumo=$4 WHERE id=$5 RETURNING *',
    [nome, email, telefone, resumo, req.params.id]
  );

  res.json(result.rows[0]);
});

app.delete('/usuarios/:id', async (req, res) => {
  await pool.query('DELETE FROM usuarios WHERE id=$1', [req.params.id]);
  res.send('Usuário deletado');
});

app.get('/usuarios/:id/completo', async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await pool.query(
      'SELECT * FROM usuarios WHERE id=$1',
      [id]
    );

    const formacoes = await pool.query(
      'SELECT * FROM formacoes WHERE usuario_id=$1',
      [id]
    );

    const experiencias = await pool.query(
      'SELECT * FROM experiencias WHERE usuario_id=$1',
      [id]
    );

    const habilidades = await pool.query(
      'SELECT * FROM habilidades WHERE usuario_id=$1',
      [id]
    );

    res.json({
      usuario: usuario.rows[0],
      formacoes: formacoes.rows,
      experiencias: experiencias.rows,
      habilidades: habilidades.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: error.message });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});