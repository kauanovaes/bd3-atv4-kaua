# BD3 — Atividade 4: Firestore

Aplicação web em HTML + CSS + JS para **cadastrar, listar e excluir alunos** no Firebase Cloud Firestore, na coleção **`BD3-NoSQL-Firestore`**. A chave `cod_turma` foi ignorada conforme a atividade. A data de nascimento é salva como **Timestamp** (bônus).

## Teste rápido (aprox. 5–10 minutos, conforme configuração da conta)

1. Acesse **https://console.firebase.google.com/** e crie/selecione seu projeto.
2. Clique em **Configurações do projeto → Geral → Seus apps → Adicionar app Web (`</>`)** (se ainda não houver um). Copie o objeto `firebaseConfig` mostrado.
3. Abra o arquivo **`firebase-config.js`** do projeto, substitua os campos `COLE_...` pelos valores reais do seu `firebaseConfig` e salve. Mantenha a estrutura `export const firebaseConfig = {...};`.
4. No Console Firebase, vá a **Build → Firestore Database → Criar banco de dados** (se não existir). Escolha a localização e crie no modo de produção (as regras abaixo controlarão o acesso). Na aba **Regras**, copie **todo o conteúdo** do arquivo `firestore.rules` e clique em **Publicar**. **Importante:** as regras são para a atividade; se o projeto for compartilhado com outros aplicativos, não substitua regras já necessárias sem integrá-las.
5. Em **Build → Authentication → Começar → Sign-in method**, habilite **Anônimo** e salve. Isso mantém cada sessão limitada aos próprios registros, segundo as regras incluídas.
6. Inicie um servidor local na **pasta que contém `index.html`**. Opções:
   - **VS Code:** instale a extensão *Live Server*, clique com o botão direito em `index.html` → **Open with Live Server**.
   - **Python:** abra o terminal na pasta do projeto e execute `python -m http.server 5500` (ou, no Windows, `py -m http.server 5500`). Depois visite **http://localhost:5500**.
7. O topo deve mostrar **“Conectado ao Firebase”**. Preencha o formulário com **dados fictícios** e clique em **Cadastrar aluno**; veja o registro na tabela. Clique em **Atualizar**, recarregue o site e confirme que o aluno continua salvo. Clique em **Excluir**, confirme e verifique que desapareceu.
8. Para verificar no Firebase: **Firestore Database → Dados → coleção `BD3-NoSQL-Firestore`**. Confira se `data_nascimento` aparece como **timestamp**, não como texto.

> A coleção é criada automaticamente pelo Firestore ao salvar o primeiro aluno. Não é preciso criar manualmente um documento vazio.

## Campos cadastrados

`cod_aluno` (número inteiro), `nome`, `cpf`, `rg`, `telefone_aluno`, `telefone_responsavel`, `email` (textos), `data_nascimento` (Firestore Timestamp), `ownerUid` (identificador técnico de segurança da sessão).

## Se houver erros

- **Configure o arquivo firebase-config.js:** ainda faltam valores do console.
- **auth/operation-not-allowed:** ative Authentication → provedor **Anônimo**.
- **permission-denied:** confira a publicação das regras e se a coleção se chama `BD3-NoSQL-Firestore` exatamente.
- **Failed to resolve module specifier / CORS / import:** não abra `index.html` com duplo clique (`file://`). Use Live Server ou Python.
- **Aluno sumiu em outro navegador ou guia anônima:** cada usuário anônimo tem um `ownerUid` próprio. No mesmo navegador/perfil os dados permanecem após atualizar. Não limpe os dados do site se quiser manter a mesma sessão.
- **Firebase Authentication não carrega:** confira domínios autorizados em Authentication → Settings. `localhost` geralmente funciona, mas pode precisar ser adicionado em projetos novos.

## GitHub / entrega

Crie um repositório **público** com o nome **`bd3-atv4-nome-aluno(a)`**, substituindo pelo seu nome (por exemplo, `bd3-atv4-kaua`), envie estes arquivos e cole o link na atividade do MS Teams. O `firebase-config.js` contém identificadores públicos do aplicativo web, **não senhas de administrador**. Não publique credenciais de conta de serviço. O controle de acesso fica nas regras do Firestore.

**Nota:** conexão real depende de você configurar seu próprio projeto Firebase; este ZIP é um projeto pronto para conectar, não contém chaves pessoais.
