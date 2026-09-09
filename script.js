// ==== Dados de administrador (fixo, para o protótipo) ====
const ADMIN_USUARIO = "admin";
const ADMIN_SENHA = "123456";

// ==== Navegação entre telas ====
function mostrar(idTela) {
  document.querySelectorAll(".tela").forEach(t => t.classList.add("oculto"));
  document.getElementById(idTela).classList.remove("oculto");

  if (idTela === "painel") {
    carregarTabela();
  }
}

// ==== Funções de armazenamento (localStorage) ====
function getDenuncias() {
  return JSON.parse(localStorage.getItem("denuncias") || "[]");
}

function salvarDenuncias(lista) {
  localStorage.setItem("denuncias", JSON.stringify(lista));
}

function gerarCodigo(tamanho, caracteres) {
  let codigo = "";
  for (let i = 0; i < tamanho; i++) {
    codigo += caracteres[Math.floor(Math.random() * caracteres.length)];
  }
  return codigo;
}

// ==== Registrar denúncia ====
document.getElementById("formDenuncia").addEventListener("submit", function (e) {
  e.preventDefault();

  const nova = {
    protocolo: "DEN-" + gerarCodigo(6, "0123456789"),
    chave: gerarCodigo(6, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"),
    categoria: document.getElementById("categoria").value,
    local: document.getElementById("local").value,
    data: document.getElementById("data").value,
    urgencia: document.getElementById("urgencia").value,
    descricao: document.getElementById("descricao").value,
    status: "Recebido"
  };

  const lista = getDenuncias();
  lista.push(nova);
  salvarDenuncias(lista);

  document.getElementById("protocoloGerado").textContent = nova.protocolo;
  document.getElementById("chaveGerada").textContent = nova.chave;
  document.getElementById("resultadoProtocolo").classList.remove("oculto");

  this.reset();
});

// ==== Consultar denúncia ====
function consultarDenuncia() {
  const protocolo = document.getElementById("buscaProtocolo").value.trim().toUpperCase();
  const chave = document.getElementById("buscaChave").value.trim().toUpperCase();
  const div = document.getElementById("resultadoConsulta");

  const encontrada = getDenuncias().find(
    d => d.protocolo.toUpperCase() === protocolo && d.chave.toUpperCase() === chave
  );

  if (!encontrada) {
    div.innerHTML = "<p class='erro'>Nenhuma denúncia encontrada com esse protocolo e chave.</p>";
    return;
  }

  div.innerHTML = `
    <p><strong>Protocolo:</strong> ${encontrada.protocolo}</p>
    <p><strong>Categoria:</strong> ${encontrada.categoria}</p>
    <p><strong>Local:</strong> ${encontrada.local}</p>
    <p><strong>Data da ocorrência:</strong> ${encontrada.data}</p>
    <p><strong>Urgência:</strong> ${encontrada.urgencia}</p>
    <p><strong>Status atual:</strong> ${encontrada.status}</p>
  `;
}

// ==== Login administrador ====
function fazerLogin() {
  const usuario = document.getElementById("loginUsuario").value.trim();
  const senha = document.getElementById("loginSenha").value.trim();

  if (usuario === ADMIN_USUARIO && senha === ADMIN_SENHA) {
    sessionStorage.setItem("logado", "sim");
    document.getElementById("erroLogin").classList.add("oculto");
    mostrar("painel");
  } else {
    document.getElementById("erroLogin").classList.remove("oculto");
  }
}

function sair() {
  sessionStorage.removeItem("logado");
  mostrar("home");
}

// ==== Painel administrativo: listar e gerenciar denúncias ====
function carregarTabela() {
  const lista = getDenuncias();
  const corpo = document.querySelector("#tabelaDenuncias tbody");
  corpo.innerHTML = "";

  if (lista.length === 0) {
    corpo.innerHTML = "<tr><td colspan='5'>Nenhuma denúncia registrada ainda.</td></tr>";
    return;
  }

  lista.forEach((d, index) => {
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td>${d.protocolo}</td>
      <td>${d.categoria}</td>
      <td>${d.urgencia}</td>
      <td>${d.status}</td>
      <td>
        <select onchange="mudarStatus(${index}, this.value)">
          <option ${d.status === "Recebido" ? "selected" : ""}>Recebido</option>
          <option ${d.status === "Em análise" ? "selected" : ""}>Em análise</option>
          <option ${d.status === "Em investigação" ? "selected" : ""}>Em investigação</option>
          <option ${d.status === "Concluído" ? "selected" : ""}>Concluído</option>
          <option ${d.status === "Arquivado" ? "selected" : ""}>Arquivado</option>
        </select>
      </td>
    `;
    corpo.appendChild(linha);
  });
}

function mudarStatus(index, novoStatus) {
  const lista = getDenuncias();
  lista[index].status = novoStatus;
  salvarDenuncias(lista);
}

// ==== Ao carregar a página, garante que o painel exige login ====
window.addEventListener("DOMContentLoaded", () => {
  mostrar("home");
});
