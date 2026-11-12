MEU FINANCEIRO — projeto PWA para iPhone

O que já funciona:
- Dashboard mensal com entradas, despesas e saldo.
- Lançamentos de receitas e despesas por categoria.
- Cartões com limite, fechamento e vencimento.
- Compras parceladas distribuídas nos meses seguintes.
- Limites de gastos por categoria.
- Cadastro de contas fixas.
- Exportação e restauração de backup JSON.
- Interface dark responsiva para iPhone.
- Cache offline por service worker.

IMPORTANTE:
1. Os dados ficam no armazenamento local do navegador (localStorage). Não há sincronização bancária ou nuvem.
2. Faça backup regularmente em Ajustes > Exportar backup.
3. O app não é publicado na App Store. Para instalar como PWA no iPhone, precisa estar hospedado em uma URL HTTPS.
4. Depois de hospedar, abra a URL no Safari > botão Compartilhar > Adicionar à Tela de Início.
5. Evite limpar os dados do site/Safari; isso pode apagar os dados locais.

Hospedagem:
Publique os arquivos desta pasta em um serviço de hospedagem estática com HTTPS (por exemplo, GitHub Pages ou Netlify). Não é necessário backend.
