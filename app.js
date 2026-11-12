const KEY='meuFinanceiroV1';
const categories=['Moradia','Alimentação','Mercado','Transporte','Saúde','Academia','Lazer','Compras','Assinaturas','Educação','Viagem','Outros'];
let db=load(), currentMonth=new Date().toISOString().slice(0,7);
const $=id=>document.getElementById(id);
$('month').value=currentMonth;$('month').addEventListener('change',e=>{currentMonth=e.target.value;render()});
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{transactions:[],cards:[],budgets:[],fixed:[]}}catch{return {transactions:[],cards:[],budgets:[],fixed:[]}}}
function save(){localStorage.setItem(KEY,JSON.stringify(db));render()}
function money(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function showPage(p){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===p));document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===p));render()}
function openDialog(html){$('dialogContent').innerHTML=html;$('dlg').showModal()}
function closeDialog(){$('dlg').close()}
function categoryOptions(){return categories.map(c=>`<option>${c}</option>`).join('')}
function openTransaction(){openDialog(`<div class="row"><h2>Novo lançamento</h2><button class="secondary" onclick="closeDialog()">✕</button></div><form id="txForm">
<label>Descrição</label><input name="description" required placeholder="Ex.: supermercado">
<label>Valor (R$)</label><input name="amount" type="number" min=".01" step=".01" required placeholder="0,00">
<label>Tipo</label><select name="type"><option value="expense">Despesa</option><option value="income">Receita</option></select>
<label>Categoria</label><select name="category">${categoryOptions()}</select>
<label>Data</label><input name="date" type="date" required value="${new Date().toISOString().slice(0,10)}">
<label>Forma de pagamento</label><select name="method" id="method"><option value="debit">Débito / dinheiro / Pix</option><option value="credit">Cartão de crédito</option></select>
<label>Cartão (se crédito)</label><select name="cardId"><option value="">Selecione</option>${db.cards.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select>
<label>Parcelas (somente crédito)</label><input name="parts" type="number" min="1" max="48" value="1">
<div class="actions"><button type="button" class="secondary" onclick="closeDialog()">Cancelar</button><button>Salvar</button></div></form>`);
$('txForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),amount=+f.get('amount'),parts=Math.max(1,Math.min(48,+f.get('parts')||1)),method=f.get('method'),date=f.get('date');if(method==='credit'&&!f.get('cardId'))return alert('Selecione um cartão.');db.transactions.push({id:crypto.randomUUID(),description:f.get('description'),amount,type:f.get('type'),category:f.get('category'),date,method,cardId:f.get('cardId'),parts,createdAt:Date.now()});closeDialog();save()}}
function openCard(){openDialog(`<div class="row"><h2>Novo cartão</h2><button class="secondary" onclick="closeDialog()">✕</button></div><form id="cardForm"><label>Nome do cartão</label><input name="name" required placeholder="Ex.: Nubank">
<label>Limite total (R$)</label><input name="limit" type="number" min="0" step=".01" required>
<label>Dia de fechamento</label><input name="closing" type="number" min="1" max="31" value="20" required>
<label>Dia de vencimento</label><input name="due" type="number" min="1" max="31" value="27" required>
<div class="actions"><button type="button" class="secondary" onclick="closeDialog()">Cancelar</button><button>Salvar cartão</button></div></form>`);
$('cardForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);db.cards.push({id:crypto.randomUUID(),name:f.get('name'),limit:+f.get('limit'),closing:+f.get('closing'),due:+f.get('due')});closeDialog();save()}}
function openBudget(){openDialog(`<h2>Definir limite mensal</h2><form id="budgetForm"><label>Categoria</label><select name="category">${categoryOptions()}</select><label>Limite (R$)</label><input name="limit" type="number" min="1" step=".01" required><div class="actions"><button type="button" class="secondary" onclick="closeDialog()">Cancelar</button><button>Salvar</button></div></form>`);$('budgetForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);db.budgets=db.budgets.filter(b=>b.category!==f.get('category'));db.budgets.push({category:f.get('category'),limit:+f.get('limit')});closeDialog();save()}}
function openFixed(){openDialog(`<h2>Adicionar conta fixa</h2><form id="fixedForm"><label>Descrição</label><input name="name" required><label>Valor mensal (R$)</label><input name="amount" type="number" min=".01" step=".01" required><label>Vencimento (dia)</label><input name="day" type="number" min="1" max="31" value="10"><div class="actions"><button type="button" class="secondary" onclick="closeDialog()">Cancelar</button><button>Salvar</button></div></form>`);$('fixedForm').onsubmit=e=>{e.preventDefault();let f=new FormData(e.target);db.fixed.push({id:crypto.randomUUID(),name:f.get('name'),amount:+f.get('amount'),day:+f.get('day')});closeDialog();save()}}
function monthOf(d){return String(d).slice(0,7)}
function cardMonth(tx,part){let d=new Date(tx.date+'T12:00:00');d.setMonth(d.getMonth()+part);return d.toISOString().slice(0,7)}
function installmentsForMonth(m){let out=[];db.transactions.filter(t=>t.method==='credit'&&t.type==='expense').forEach(t=>{for(let i=0;i<t.parts;i++)if(cardMonth(t,i)===m)out.push({...t,part:i+1,amount:+t.amount/t.parts})});return out}
function spentForMonth(m){let total=0;db.transactions.filter(t=>t.method!=='credit'&&monthOf(t.date)===m&&t.type==='expense').forEach(t=>total+=+t.amount);return total+installmentsForMonth(m).reduce((a,t)=>a+t.amount,0)}
function render(){const txs=db.transactions.filter(t=>monthOf(t.date)===currentMonth),income=txs.filter(t=>t.type==='income').reduce((a,t)=>a+ +t.amount,0),cashOut=txs.filter(t=>t.type==='expense'&&t.method!=='credit').reduce((a,t)=>a+ +t.amount,0),inst=installmentsForMonth(currentMonth),credit=inst.reduce((a,t)=>a+t.amount,0),out=cashOut+credit;
$('balance').textContent=money(income-out);$('income').textContent=money(income);$('expenses').textContent=money(out);
let open=credit;db.cards.forEach(c=>{open+=db.transactions.filter(t=>t.cardId===c.id&&t.method==='credit').reduce((a,t)=>a+ +t.amount,0)-db.transactions.filter(t=>t.cardId===c.id&&t.method==='credit'&&t.paid).reduce((a,t)=>a+ +t.amount,0)});$('openBills').textContent=money(open);
$('availableLimit').textContent=money(db.cards.reduce((sum,c)=>sum+c.limit-db.transactions.filter(t=>t.cardId===c.id&&t.method==='credit'&&!t.paid).reduce((a,t)=>a+ +t.amount,0),0));
let cats={};txs.filter(t=>t.type==='expense'&&t.method!=='credit').forEach(t=>cats[t.category]=(cats[t.category]||0)+ +t.amount);inst.forEach(t=>cats[t.category]=(cats[t.category]||0)+t.amount);
$('categoryBreakdown').innerHTML=Object.keys(cats).length?Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<div class="item"><span>${esc(c)}</span><b>${money(v)}</b></div>`).join(''):'<div class="empty">Sem despesas neste mês.</div>';
let recent=[...txs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);$('recent').innerHTML=recent.length?recent.map(txHtml).join(''):'<div class="empty">Adicione seu primeiro lançamento.</div>';
$('transactionList').innerHTML=[...txs].sort((a,b)=>b.date.localeCompare(a.date)).map(txHtml).join('')||'<div class="empty">Nenhum lançamento neste mês.</div>';
$('cardList').innerHTML=db.cards.map(c=>{let used=db.transactions.filter(t=>t.cardId===c.id&&t.method==='credit'&&!t.paid).reduce((a,t)=>a+ +t.amount,0),pct=c.limit?Math.min(100,used/c.limit*100):0;return `<div class="card"><div class="row"><b>${esc(c.name)}</b><span class="pill">fecha dia ${c.closing} · vence dia ${c.due}</span></div><div style="font-size:23px;margin:13px 0">${money(Math.max(0,c.limit-used))} <span class="muted" style="font-size:12px">disponível</span></div><div class="bar"><i style="width:${pct}%"></i></div><p class="hint">Utilizado: ${money(used)} de ${money(c.limit)}</p><button class="secondary" onclick="deleteCard('${c.id}')">Excluir cartão</button></div>`}).join('')||'<div class="empty">Cadastre seu cartão para acompanhar faturas.</div>';
$('installments').innerHTML=inst.length?inst.map(t=>`<div class="item"><div>${esc(t.description)}<div class="hint">${t.part}/${t.parts} parcelas · ${esc(t.category)}</div></div><b>${money(t.amount)}</b></div>`).join(''):'<div class="empty">Nenhuma parcela neste mês.</div>';
$('budgetList').innerHTML=db.budgets.map(b=>{let used=spentForCategory(b.category,currentMonth),p=Math.min(100,used/b.limit*100);return `<div class="item" style="display:block"><div class="row"><b>${esc(b.category)}</b><span>${money(used)} / ${money(b.limit)}</span></div><div class="bar"><i style="width:${p}%;background:${p>=100?'var(--red)':'var(--green)'}"></i></div><div class="row hint"><span>${Math.round(p)}% utilizado</span><button class="secondary" onclick="deleteBudget('${esc(b.category)}')">Remover</button></div></div>`}).join('')||'<div class="empty">Defina limites para controlar seus gastos.</div>';
$('fixedList').innerHTML=db.fixed.map(f=>`<div class="item"><span>${esc(f.name)} <span class="hint">· dia ${f.day}</span></span><b>${money(f.amount)}</b><button class="secondary" onclick="deleteFixed('${f.id}')">×</button></div>`).join('')||'<div class="empty">Nenhuma conta fixa cadastrada.</div>'}
function spentForCategory(c,m){let cash=db.transactions.filter(t=>monthOf(t.date)===m&&t.category===c&&t.type==='expense'&&t.method!=='credit').reduce((a,t)=>a+ +t.amount,0);return cash+installmentsForMonth(m).filter(t=>t.category===c).reduce((a,t)=>a+t.amount,0)}
function txHtml(t){let sign=t.type==='income'?'+':'−';return `<div class="item"><div><b>${esc(t.description)}</b><div class="hint">${esc(t.category)} · ${new Date(t.date+'T12:00:00').toLocaleDateString('pt-BR')} ${t.method==='credit'?'· crédito':''}</div></div><div style="text-align:right"><b class="${t.type==='income'?'income':'expense'}">${sign} ${money(t.amount)}</b><div><button class="secondary" onclick="deleteTx('${t.id}')">Excluir</button></div></div></div>`}
function deleteTx(id){if(confirm('Excluir este lançamento?')){db.transactions=db.transactions.filter(t=>t.id!==id);save()}}
function deleteCard(id){if(confirm('Excluir cartão? Lançamentos vinculados serão mantidos.')){db.cards=db.cards.filter(c=>c.id!==id);save()}}
function deleteBudget(c){db.budgets=db.budgets.filter(b=>b.category!==c);save()}
function deleteFixed(id){db.fixed=db.fixed.filter(f=>f.id!==id);save()}
function exportData(){let blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='backup-meu-financeiro.json';a.click();URL.revokeObjectURL(a.href)}
$('importFile').addEventListener('change',async e=>{let f=e.target.files[0];if(!f)return;try{let d=JSON.parse(await f.text());if(!d.transactions||!d.cards)throw Error();db=d;save();alert('Backup restaurado!')}catch{alert('Arquivo de backup inválido.')}});
function clearData(){if(confirm('Isso apagará permanentemente todos os lançamentos, cartões e metas deste navegador. Continuar?')){localStorage.removeItem(KEY);db={transactions:[],cards:[],budgets:[],fixed:[]};save()}}
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();