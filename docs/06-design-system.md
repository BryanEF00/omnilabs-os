# OmniLabs OS - Diretrizes do Design System & Ergonomia Visual (`OmniDS`)

> **Propósito**: Estabelecer a taxonomia visual definitiva, matriz cromática, padrões de contraste (WCAG) e regras de interação de interface do OmniLabs OS para o laboratório LD2.

---

## 1. Filosofia Visual & Arquitetura de Layout (Workspace Moderno)

Inspirado na ergonomia de ambientes de alta produtividade como o **Antigravity 2.0**, **Linear** e **macOS**:

* **Arquitetura de Tema: Modo Light Exclusivo (Decisão Arquitetural)**:
  * **Zero Dark Mode no MVP**: A bancada do LD2 opera 24/7 sob lâmpadas fluorescentes brancas industriais. Telas escuras geram reflexos incômodos no monitor e dificultam a leitura com óculos de proteção e luvas.
  * **Identidade Japonesa Ajinomoto**: Fundo claro e limpo com acentos no Vermelho Oficial Ajinomoto homenageia a identidade visual corporativa da empresa.
  * **Fundo de Descanso Óptico (`#f8fafc`)**: O fundo de tela geral é um cinza gelo suave (Slate 50), e nunca branco 100% estourado, garantindo descanso visual prolongado aos operadores, inclusive no 3º Turno.
* **Layout de Painel Dividido (Split Workspace)**:
  * **Sidebar Lateral Fixa à Esquerda**: Fundo próprio com contraste evidente em relação à tela central, abrigando a marca Ajinomoto e os módulos de navegação. Os itens flutuam diretamente sobre ela, com indicador de estado ativo evidente e elegante.
  * **Área de Trabalho Principal à Direita**: Fundo cinza suave de descanso visual (`#f8fafc`) com cards e superfícies de trabalho em branco puro (`#ffffff`) que flutuam através de sombras leves (`shadow-xs`) e elevação óptica, sem contornos pesados.
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
| **`action-indigo`** | `#2563eb` | **Azul Índigo Japonês**. Curvas cinéticas em gráficos de fermentação e badge de status "Em curso". | Proibido usar como cor de botão de ação (para não competir com o vermelho). |
| **`status-danger`** | `#dc2626` | **Carmesim de Alerta / Erro**. Mensagens de falha e limpezas atrasadas, **sempre acompanhado de ícone de aviso**. | Proibido usar sem ícone (o operador pode confundir com o vermelho da marca). |

### 2.1. Matriz Semântica dos 5 Status (Semáforo Biológico)
Badges e pílulas de status utilizam sempre a técnica moderna de **fundo pastel suave (tom 50) + borda fina (tom 200) + texto escuro (tom 800) + ícone contextual**:

1. **Verde (`#059669` / `bg-emerald-50 text-emerald-800 border-emerald-200`)**: Concluído, normal, parâmetro biológico dentro da faixa ideal. (Ícone: checkmark `✓`).
2. **Âmbar / Mel (`#d97706` / `bg-amber-50 text-amber-800 border-amber-200`)**: Pendente, atenção preventiva, atividade que vence hoje. (Ícone: relógio ou triângulo suave). *Evita o amarelo-limão puro que ofusca no modo light*.
3. **Vermelho Carmesim (`#dc2626` / `bg-rose-50 text-rose-800 border-rose-200`)**: Limpeza atrasada, falha crítica ou desvio biológico. (Ícone de perigo obrigatório).
4. **Azul Índigo (`#2563eb` / `bg-blue-50 text-blue-800 border-blue-200`)**: Em curso, fermentação ativa, alimentação ligada e destaque de métricas. (Ícone de pulso ativo).
5. **Cinza Neutro (`#64748b` / `bg-neutral-100 text-neutral-700 border-neutral-200`)**: Informativo geral, comunicados e notas sem prazo ou criticidade. (Ícone: `ℹ`).

---

## 3. Taxonomia Rigorosa de Botões & Hierarquia de Ação

Inspirado nos maiores Design Systems do mundo (Shopify Polaris, GitHub Primer e Stripe Sail), as ações não são divididas por departamentos arbitrários. Os botões comunicam **hierarquia pura e inequívoca de importância**.

### A Regra de Ouro (Outline vs. Ghost):
* **Ghost é para SAIR / CANCELAR (Passivo)**: Não possui borda nem corpo para não concorrer com o botão primário de confirmação.
* **Outline é para CONSTRUIR / FILTRAR (Ativo)**: Possui borda física para se alinhar em altura (38px) e presença junto a caixas de texto e barras de ferramentas.

---

### 3.1. Botão Primário Único (Vermelho Oficial Ajinomoto `#de3636`)
* **Propósito**: A **ação principal e recomendada de avanço/confirmação** em qualquer tela, modal ou formulário do sistema.
* **Exemplos**: `"Gravar ocorrência"`, `"Entrar no sistema"`, `"Iniciar turno"`, `"Cadastrar analista"`, `"Salvar configurações"`.
* **Visual**: Fundo Vermelho Ajinomoto sólido (`bg-[#de3636] text-white`).
* **Física**: Sem borda aparente, sombra sutil em repouso (`shadow-xs`), leve elevação (`shadow-md`) e microbrilho no hover.
* **Regra Inegociável**: **Apenas 1 botão primário por contexto/tela**. O operador nunca hesita: vermelho significa "Confirmar / Gravar / Avançar".

---

### 3.2. Botão Ghost (Transparente com Texto Dinâmico)
* **Propósito**: Ações de saída, descarte ou cancelamento em modais e formulários.
* **Visual em Repouso**: Fundo 100% transparente com texto cinza neutro (`text-neutral-500 font-medium`).
* **Física no Hover**: Ganha base cinza suave (`hover:bg-neutral-100`) e o **texto salta para quase preto semi-bold (`hover:text-neutral-950`)**, fornecendo feedback tátil imediato sem poluição visual prévia.
* **Exemplos**: `"Cancelar"`, `"Voltar"`, `"Limpar"`, `"Fechar"`.

---

### 3.3. Botão Secundário (Outline com Borda Sutil)
* **Propósito**: Ações ativas de apoio, inserções secundárias ou filtros que dividem espaço com campos de texto.
* **Visual**: Fundo branco ou neutro suave com borda cinza clara (`bg-white border border-neutral-300 text-neutral-700`).
* **Física no Hover**: Borda ligeiramente mais escura (`hover:border-neutral-400`), fundo cinza suave (`hover:bg-neutral-50`) e texto quase preto (`hover:text-neutral-950`).
* **Exemplos**: `"Filtros"`, `"Adicionar parâmetro"`, `"Anexar nota"`.

---

### 3.4. Botão Destrutivo Seguro (Alerta de Perigo)
* **Propósito**: Exclusões permanentes e cancelamentos com risco de perda de dados.
* **Visual em Repouso**: Fundo rosado suave com borda sutil e texto carmesim (`bg-rose-50 border border-rose-200 text-rose-700 font-medium`).
* **Física no Hover**: Acende com fundo vermelho sólido e texto branco (`hover:bg-rose-600 hover:text-white`), garantindo que o operador só sinta o impacto do perigo se tiver a intenção real de deletar.
* **Exemplos**: `"Excluir lote"`, `"Descartar amostra"`, `"Revogar acesso"`.

---

### 3.5. Botões de Ícone (Ghost Icons de 32x32px)
* **Propósito**: Ações rápidas em linha dentro de cards do feed ou células de tabelas densas, sem ocupar largura de tela com rótulos de texto.
* **Edição / Atualização**: Ícone cinza neutro em repouso (`text-neutral-400`); no hover ganha fundo cinza e ícone preto escuro (`hover:text-neutral-950 hover:bg-neutral-100`).
* **Lixeira Ghost**: Ícone cinza transparente em repouso (`text-neutral-400`); no hover acende imediatamente em fundo rosado suave com ícone vermelho carmesim (`hover:text-rose-600 hover:bg-rose-50`). Evita o efeito "cemitério de manchas vermelhas" em listas com dezenas de itens.

---

### 3.6. Botão de Link / Inline (Hiperlink de Ação)
* **Propósito**: Navegação secundária sem formato de caixa, ideal para fluxos auxiliares.
* **Visual**: Texto cinza (`text-neutral-500 underline underline-offset-4`) que escurece para preto no hover (`hover:text-neutral-950`).
* **Exemplos**: `"Ver histórico completo →"`, `"Esqueci minha senha"`.

---

### 3.7. Ações de Exportação e Relatórios (Excel e Laudos)
* **Padrão Adotado**: Utilizam o **Botão Secundário (Outline com Ícone)** (ex.: `[ 📥 Exportar Excel ]`).
* **Regra de Ergonomia**: Proibido criar botões sólidos azuis que concorram visualmente com o botão primário vermelho. Toda exportação tem presença limpa e discreta via Outline.

---

## 4. Tooltips Informativos, Popovers & Ajuda Contextual

Para tirar dúvidas na bancada sem poluir a interface:
* **Botão de Ajuda Contextual `[ ? ]`**:
  * Botão circular discreto cinza (`w-4 h-4 rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-800 hover:text-white text-[10px] font-bold`) posicionado ao lado de siglas ou parâmetros laboratoriais.
  * Ao passar o mouse (hover) ou clicar, dispara o **Dark Tooltip Universal**.
* **Dark Tooltip Universal**:
  * Ao passar o mouse sobre o botão `[ ? ]` ou siglas técnicas (`vvm`, `DO`, `RPM`, `pH`):
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
