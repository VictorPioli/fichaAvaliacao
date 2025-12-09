# Ficha de Avaliação

Projeto React (Vite + TypeScript) com formulário de avaliação em PT-BR.

## Requisitos
- Node.js 18+
- Windows PowerShell (padrão do seu ambiente)

## Instalação
```powershell
# Na pasta do projeto
npm install
```

## Executar em desenvolvimento
```powershell
npm run dev
```
Abra o endereço exibido (por padrão `http://localhost:5173`).

## Build de produção
```powershell
npm run build
npm run preview
```

Os dados do formulário são persistidos em `localStorage`. Botão "Limpar" apaga e reseta.

## Exportar PDF
Para exportar os dados enviados em PDF, as bibliotecas necessárias já estão listadas. Caso precise, instale-as:
```powershell
npm install jspdf jspdf-autotable
```
Ao clicar em "Enviar", o PDF é gerado e baixado automaticamente com os dados preenchidos.
