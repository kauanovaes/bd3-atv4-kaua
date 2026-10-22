import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs, query, where, Timestamp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const COLECAO = 'BD3-NoSQL-Firestore';
const form = document.querySelector('#form-aluno');
const list = document.querySelector('#alunos');
const total = document.querySelector('#total');
const message = document.querySelector('#message');
const saveButton = document.querySelector('#btn-salvar');
const refreshButton = document.querySelector('#btn-atualizar');
const connection = document.querySelector('#connection');
const connectionText = document.querySelector('#connection-text');
let db;
let userId;

function aviso(texto, tipo = '') {
  message.textContent = texto;
  message.className = `message ${tipo}`;
}
function status(texto, classe = '') {
  connection.className = `status ${classe}`;
  connectionText.textContent = texto;
}
function td(texto) {
  const cell = document.createElement('td');
  cell.textContent = String(texto ?? '');
  return cell;
}
function displayDate(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== 'function') return '—';
  return timestamp.toDate().toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}
function erroAmigavel(error) {
  const code = error?.code || '';
  if (code === 'auth/operation-not-allowed') return 'Ative o provedor Anônimo em Firebase > Authentication > Sign-in method.';
  if (code === 'permission-denied') return 'Permissão negada: confira as regras do Firestore e a autenticação.';
  if (code === 'unavailable') return 'Firestore indisponível. Confira sua internet e tente novamente.';
  if (code.includes('auth/invalid-api-key') || code.includes('auth/configuration-not-found')) return 'Configuração do Firebase inválida. Confira firebase-config.js e Authentication.';
  return `Não foi possível concluir a operação: ${error?.message || 'erro desconhecido'}`;
}
function semDados(texto) {
  list.replaceChildren();
  const tr = document.createElement('tr');
  const cell = td(texto);
  cell.colSpan = 6;
  cell.className = 'empty';
  tr.append(cell);
  list.append(tr);
}
async function listar() {
  if (!db || !userId) return;
  refreshButton.disabled = true;
  semDados('Carregando alunos…');
  try {
    const consulta = query(collection(db, COLECAO), where('ownerUid', '==', userId));
    const resultado = await getDocs(consulta);
    const alunos = resultado.docs.map(d => ({ id: d.id, ...d.data() }));
    alunos.sort((a,b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'));
    total.textContent = alunos.length;
    list.replaceChildren();
    if (!alunos.length) return semDados('Nenhum aluno cadastrado. Use o formulário acima.');
    for (const aluno of alunos) {
      const tr = document.createElement('tr');
      tr.append(td(aluno.cod_aluno), td(aluno.nome), td(aluno.cpf), td(aluno.email), td(displayDate(aluno.data_nascimento)));
      const actions = document.createElement('td');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'danger';
      button.textContent = 'Excluir';
      button.setAttribute('aria-label', `Excluir ${aluno.nome}`);
      button.addEventListener('click', async () => {
        if (!window.confirm(`Excluir o registro de ${aluno.nome}?`)) return;
        button.disabled = true;
        try {
          await deleteDoc(doc(db, COLECAO, aluno.id));
          aviso('Aluno excluído com sucesso.', 'success');
          await listar();
        } catch (error) { aviso(erroAmigavel(error), 'error'); button.disabled = false; }
      });
      actions.append(button);
      tr.append(actions);
      list.append(tr);
    }
  } catch (error) {
    aviso(erroAmigavel(error), 'error');
    semDados('Não foi possível listar os alunos.');
  } finally { refreshButton.disabled = false; }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!db || !userId || !form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form).entries());
  const codigo = Number(values.cod_aluno);
  if (!Number.isSafeInteger(codigo) || codigo < 1) return aviso('Informe um código inteiro positivo.', 'error');
  // Usar UTC evita que o fuso horário mude o dia de nascimento ao listar.
  const nascimento = new Date(`${values.data_nascimento}T12:00:00.000Z`);
  if (Number.isNaN(nascimento.getTime())) return aviso('Informe uma data de nascimento válida.', 'error');
  saveButton.disabled = true;
  saveButton.textContent = 'Salvando…';
  try {
    await addDoc(collection(db, COLECAO), {
      cod_aluno: codigo,
      nome: values.nome.trim(),
      cpf: values.cpf.trim(),
      rg: values.rg.trim(),
      telefone_aluno: values.telefone_aluno.trim(),
      telefone_responsavel: values.telefone_responsavel.trim(),
      email: values.email.trim(),
      data_nascimento: Timestamp.fromDate(nascimento),
      ownerUid: userId
    });
    form.reset();
    aviso('Aluno cadastrado com sucesso!', 'success');
    await listar();
  } catch (error) { aviso(erroAmigavel(error), 'error'); }
  finally { saveButton.disabled = false; saveButton.textContent = '+ Cadastrar aluno'; }
});
refreshButton.addEventListener('click', listar);

async function iniciar() {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith('COLE_') || firebaseConfig.projectId.startsWith('COLE_')) {
    status('Configure o arquivo firebase-config.js', 'error');
    aviso('Falta colar a configuração Web do Firebase em firebase-config.js. Veja o README.md.', 'error');
    semDados('Configure o Firebase para começar.');
    return;
  }
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    const auth = getAuth(app);
    onAuthStateChanged(auth, async user => {
      if (!user) {
        try { await signInAnonymously(auth); }
        catch (e) { status('Falha na autenticação', 'error'); aviso(erroAmigavel(e), 'error'); }
        return;
      }
      userId = user.uid;
      status('Conectado ao Firebase', 'ok');
      saveButton.disabled = false;
      refreshButton.disabled = false;
      aviso('');
      await listar();
    });
  } catch (error) { status('Falha na conexão', 'error'); aviso(erroAmigavel(error), 'error'); }
}
iniciar();
