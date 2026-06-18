# 🎓 SpherEdu — Frontend

Sistema desenvolvido como Projeto Integrador (PI) do SENAC, com foco na gestão de Atividades Complementares para instituições de ensino.

---

## 📌 Sobre o Projeto

Interface web do SpherEdu, construída em HTML, CSS e JavaScript puro, com suporte a PWA para instalação como aplicativo em dispositivos móveis e desktop.

---

## 🚀 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (Vanilla)
- PWA (Progressive Web App)
- Service Worker
- Deploy: Render

---

## 🧩 Páginas e Funcionalidades

### 🔑 Login
- Autenticação com e-mail e senha
- Redirecionamento automático por perfil (superadmin, coordenador, aluno)

### 🛠️ Admin (SuperAdmin)
- Dashboard geral
- Gerenciamento de alunos (criar, editar, remover, atribuir cursos)
- Gerenciamento de coordenadores
- Gerenciamento de cursos
- Gerenciamento de regras por curso
- Avaliação de atividades

### 🧑‍🏫 Coordenador
- Dashboard com visão dos seus alunos
- Lista de alunos vinculados aos seus cursos
- Avaliação de atividades submetidas
- Gerenciamento de regras

---

## 📱 PWA (Progressive Web App)

O SpherEdu pode ser instalado como aplicativo:

- `manifest.json` configurado com ícones e tema
- `sw.js` (Service Worker) com cache offline dos arquivos principais
- Compatível com Android, iOS e desktop via navegador
- Funciona via HTTPS (obrigatório para PWA)

Arquivos PWA ficam em `SpherEdu/`:
```
SpherEdu/
├── manifest.json
├── sw.js
├── icon-192.png
├── icon-512.png
└── index.html
```

---

## 📁 Estrutura do Projeto

```
SpherEdu/
├── index.html               — entrada, redireciona para login
├── manifest.json            — configuração do PWA
├── sw.js                    — service worker
├── spheredu.css             — estilos globais
├── Api.js                   — configuração base da API
├── Login/                   — tela de login
├── Admin/
│   ├── Dashboard/
│   ├── Alunos/
│   ├── Coordenadores/
│   ├── Cursos/
│   ├── Regras/
│   └── Atividades/
└── Coordenador/
    ├── Dashboard/
    ├── Alunos/
    ├── Regras/
    └── Atividades/
```

---

## 🔐 Autenticação

O frontend armazena o token JWT retornado pelo backend e o envia no header `Authorization: Bearer <token>` em todas as requisições autenticadas.

---

## 📚 Contexto Acadêmico

Projeto desenvolvido como parte do Projeto Integrador (PI) do SENAC — Análise e Desenvolvimento de Sistemas.

---

## 👨‍💻 Equipe

- Daniel Cabral
- Ian Gabriel
- Sabrina Beatriz
- Marcelo Lira
- Otávio Augusto

---

## 📌 Status

🚧 Em desenvolvimento / aprimoramento contínuo
