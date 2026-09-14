# OmniLabs OS - Diretrizes do Design System & Ergonomia Visual (`OmniDS`)

> **Propósito**: Estabelecer a taxonomia visual definitiva, matriz cromática, padrões de contraste (WCAG) e regras de interação de interface do OmniLabs OS para o laboratório LD2.

---

## 1. Filosofia Visual & Arquitetura de Layout (Workspace Moderno)

Inspirado na ergonomia de ambientes de alta produtividade como o **Antigravity 2.0**, **Linear** e **macOS**:

* **Layout de Painel Dividido (Split Workspace)**:
  * **Sidebar Lateral Fixa à Esquerda**: Fundo próprio com contraste evidente em relação à tela central, abrigando a marca Ajinomoto e os módulos de navegação. Os itens flutuam diretamente sobre ela, com indicador de estado ativo evidente e elegante.
  * **Área de Trabalho Principal à Direita**: Fundo cinza suave de descanso visual (`#f8fafc` / `#f4f4f5`) com cards e superfícies de trabalho em branco puro (`#ffffff`) que flutuam através de sombras leves e elevação óptica, sem a necessidade de contornos ou bordas pesadas.
* **Economia Cognitiva (As 4 Proibições Formais)**:
  1. **Anti-aninhamento ("Card Inception" Banido)**: Proibido delimitar caixas dentro de caixas. A organização interna de um painel é feita com tipografia e espaçamento (grade de 4px/8px), nunca com bordas redundantes.
  2. **Zero Pleonasmos Contextuais**: Se o operador está no módulo do LD2, as telas são *"Caderno de turno"*, *"Atividades de rotina"*, *"Cronograma semanal"*. Proibido carimbar *"do LD2"* em cada título.
  3. **Zero Emojis na Interface**: A interface é um ambiente industrial e biotecnológico sério. Emojis são 100% proibidos.
  4. **Placeholders Mínimos**: O placeholder nunca ensina a preencher. Ele é conciso: `"Nome completo"`, `"Senha"`, `"Sigla"`. Proibido `"Insira..."` ou `"Exemplo: ..."`.

---

## 2. Matriz Cromática Oficial & Contraste (Acessibilidade WCAG)

Todas as combinações de texto e fundo devem respeitar rigorosamente o nível **WCAG AA** (contraste mínimo de **4.5:1** para texto normal e **3.0:1** para componentes de interface e botões).

| Token Semântico | Código HEX | Finalidade no Mundo Real | O que NUNCA fazer com esta cor |
| :--- | :--- | :--- | :--- |
| **`brand-primary`** | `#de3636` | **Vermelho Oficial Ajinomoto (Pantone 186 C)**. Usado no logotipo, no botão de ação primária única da tela e na borda do menu ativo. | Proibido usar como cor de fundo de alertas de erro ou em botões secundários. |
| **`brand-light`** | `#ffefe5` | **Fundo Pêssego / Acento da Marca**. Usado exclusivamente sobre superfícies **brancas** (item ativo da sidebar e crachás de turno). | **Proibido usar sobre fundos cinzas** (gera atrito cromático). Proibido usar em botões clicáveis normais. |
| **`bg-app`** | `#f8fafc` | **Fundo de Tela do Sistema (Descanso 24/7)**. Cinza gelo suave que reduz a fadiga ocular dos operadores no 3º Turno. | Proibido usar branco 100% como fundo de tela geral. |
| **`bg-surface`** | `#ffffff` | **Superfície de Cards e Painéis**. Branco puro com sombra sutil (`shadow-xs` a `shadow-sm`). | Proibido empilhar cards brancos dentro de cards brancos. |
| **`neutral-soft`** | `#f5f5f5` | **Cinza Neutro Puro (Sem azulado)**. Fundo de botões secundários e trilhos de filtros. | Proibido usar tons azulados de slate quando o objetivo for neutralidade. |
| **`neutral-dark`** | `#0f172a` | **Dark Slate / Obsidiana**. Texto principal de altíssimo contraste e tooltips informativos escuros. | Proibido usar cinza claro para textos de leitura crítica. |
| **`action-indigo`** | `#1e40af` | **Azul Índigo Japonês (`Aiiro`)**. Cor terciária para ações de dados: relatórios, exportar Excel e gráficos. | Proibido usar para botões de confirmação simples de formulário. |
| **`status-danger`** | `#dc2626` | **Carmesim de Alerta / Erro**. Mensagens de falha e limpezas atrasadas, **sempre acompanhado de ícone de aviso**. | Proibido usar sem ícone (o operador pode confundir com o vermelho da marca). |

---

## 3. Taxonomia Rigorosa de Botões & Hierarquia de Ação

Inspirado nos maiores Design Systems do mundo (Shopify Polaris, GitHub Primer e Stripe Sail), as ações não são divididas por departamentos arbitrários. Os botões comunicam **hierarquia pura e inequívoca de importância**:

### 3.1. Botão Primário Único (Vermelho Oficial Ajinomoto `#de3636`)
* **Propósito**: É a **ação principal e recomendada de avanço/confirmação** em qualquer tela, modal ou formulário do sistema, sem exceção.
* **Exemplos**: `"Gravar ocorrência"`, `"Entrar no sistema"`, `"Iniciar turno"`, `"Cadastrar analista"`, `"Salvar configurações"`.
* **Visual**: Fundo Vermelho Ajinomoto sólido (`bg-[#de3636] text-white`).
* **Física**: Sem borda aparente, sombra sutil em repouso (`shadow-xs`), leve elevação (`shadow-md`) e microbrilho no hover.
* **Regra Inegociável de Ergonomia**: **Existe apenas 1 botão primário por contexto/tela**. O operador nunca hesita: vermelho significa "Confirmar / Gravar / Avançar".

---

### 3.2. Botão Secundário / Descarte (Cinza Neutro Suave `#f5f5f5`)
* **Propósito**: Ações de apoio, cancelamento, descarte ou fechamento que não devem concorrer visualmente com o botão primário.
* **Visual**: Fundo Cinza Neutro Suave (`bg-neutral-100 hover:bg-neutral-200 text-neutral-700 hover:text-neutral-950`).
* **Física**: Sem borda aparente, mesma altura (38px) do primário. No hover, o texto salta para quase preto semi-bold.
* **Exemplos**: `"Cancelar"`, `"Voltar"`, `"Limpar"`, `"Fechar"`.

---

### 3.3. Botão de Inteligência & Ações de Dados (Azul Índigo Japonês `#1e40af`)
* **Propósito**: O azul índigo (`Aiiro`) é reservado exclusivamente para **consumo e exportação de dados laboratoriais**.
* **Exemplos**: `"Exportar Excel"`, `"Imprimir caderno de turno"`, `"Gerar relatório semanal"`.
* **Regra**: O botão azul nunca concorre com o formulário de gravação; ele é o atalho para inteligência e relatórios do laboratório.

---

### 3.4. Ações Destrutivas (Exclusão Segura)
A exclusão nunca deve parecer uma ação primária comum:
* **Em Formulários / Modais de Confirmação**: Fundo rosado suave (`bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white`). O botão só ganha força vermelha se o usuário passar o mouse para confirmar a intenção real de deletar.
* **Em Cards e Tabelas (Botões Ghost)**:
  * **Repouso**: A lixeira é cinza neutro e transparente (`text-neutral-400`). Ela se camufla perfeitamente na superfície branca do card, garantindo que um feed com 40 ocorrências não pareça um cemitério cheio de manchas vermelhas.
  * **Hover**: Ao passar o mouse na lixeira, ela acende imediatamente em fundo rosado suave com o ícone em vermelho carmesim (`hover:bg-rose-50 hover:text-rose-600`).
  * **Lápis de Edição**: Transparente em repouso; no hover ganha fundo cinza suave com ícone preto escuro (`hover:bg-neutral-100 hover:text-neutral-900`).

---

## 4. Tooltips Informativos, Popovers & Badges

Para tirar dúvidas na bancada sem poluir a interface:
* **Dark Tooltip Universal**:
  * Ao passar o mouse sobre siglas técnicas (`vvm`, `DO`, `RPM`, `pH`), parâmetros ou textos compactados:
  * Abre uma caixa preta de alta autoridade (`bg-neutral-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-md shadow-lg`).
  * O contraste preto sobre branco garante legibilidade instantânea sob as lâmpadas fluorescentes da bancada.
* **Segmented Controls (Filtros de Abas "Hoje / Semana / Mês")**:
  * Trilho em cinza neutro suave (`bg-neutral-200/70 p-1 rounded-lg`).
  * Item ativo em **Branco Puro com sombra suave e texto preto** (`bg-white shadow-xs text-neutral-900 font-semibold`).

---

## 5. Tabela de Anti-Padrões (O Que NUNCA Fazer no OmniLabs OS)

| Anti-Padrão (Proibido) | Por que é proibido? | Alternativa Correta |
| :--- | :--- | :--- |
| **Cinza sobre cinza com hover cinza** | Destrói o contraste e gera dúvida se o botão está desabilitado ou ativo. | Usar fundo branco com sombra ou texto que salta para preto puro. |
| **Lixeiras vermelhas acesas em repouso** | Gera alarme visual e poluição em listas extensas de ocorrências. | Ícone cinza neutro transparente em repouso; só acende no hover. |
| **Fundo pêssego sobre container cinza** | Gera atrito cromático feio entre tom quente e tom neutro. | Usar pêssego apenas sobre superfícies brancas. No cinza, usar pílula branca. |
| **Dois botões primários na mesma tela** | O cérebro do operador não sabe qual é a ação recomendada. | Apenas 1 botão primário por contexto. O resto é secundário ou ghost. |
| **Title Case ("Caderno De Turno")** | Padrão anglo-saxão artificial com conflito de preposições em português. | 100% **Sentence case** ("Caderno de turno"). |
