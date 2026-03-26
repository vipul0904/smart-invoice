// ── React Contexts (Theme + Invoice) ──
var useState = React.useState, useEffect = React.useEffect, useContext = React.useContext,
    createContext = React.createContext, useCallback = React.useCallback, useRef = React.useRef;

var ThemeContext = createContext();
function ThemeProvider(props) {
  var _s = useState(function(){ return localStorage.getItem('theme')||'light'; }), theme=_s[0], setTheme=_s[1];
  useEffect(function(){ document.documentElement.classList.toggle('dark', theme==='dark'); localStorage.setItem('theme',theme); },[theme]);
  var toggleTheme = useCallback(function(){ setTheme(function(t){ return t==='light'?'dark':'light'; }); },[]);
  return html`<${ThemeContext.Provider} value=${{theme:theme,toggleTheme:toggleTheme}}>${props.children}<//>`;
}

var InvoiceContext = createContext();
var emptyItem = { name:'', description:'', quantity:1, price:0 };
function getDefaultInvoice() {
  return { id:'', companyName:'', companyLogo:'', companyAddress:'', companyPhone:'', companyEmail:'', companyGST:'',
    clientName:'', clientAddress:'', clientPhone:'', clientEmail:'', clientGST:'',
    invoiceNumber:generateInvoiceNumber(), invoiceDate:getTodayDate(), dueDate:getDueDate(),
    currency:'₹', items:[Object.assign({},emptyItem)], gstRate:18, discountRate:0,
    notes:'', terms:'Payment is due within 30 days of the invoice date.' };
}
function InvoiceProvider(props) {
  var _s=useState(getDefaultInvoice), invoice=_s[0], setInvoice=_s[1];
  var _e=useState(null), editingId=_e[0], setEditingId=_e[1];
  var updateField = useCallback(function(field,value){ setInvoice(function(p){ var n=Object.assign({},p); n[field]=value; return n; }); },[]);
  var updateItem = useCallback(function(index,field,value){ setInvoice(function(p){ var items=p.items.slice(); items[index]=Object.assign({},items[index]); items[index][field]=value; return Object.assign({},p,{items:items}); }); },[]);
  var addItem = useCallback(function(){ setInvoice(function(p){ return Object.assign({},p,{items:p.items.concat([Object.assign({},emptyItem)])}); }); },[]);
  var removeItem = useCallback(function(index){ setInvoice(function(p){ return Object.assign({},p,{items:p.items.filter(function(_,i){return i!==index;})}); }); },[]);
  var clearForm = useCallback(function(){ setInvoice(getDefaultInvoice()); setEditingId(null); },[]);
  var loadInvoice = useCallback(function(inv){ setInvoice(inv); setEditingId(inv.id); },[]);
  var totals = calculateTotals(invoice.items, invoice.gstRate, invoice.discountRate);
  return html`<${InvoiceContext.Provider} value=${{invoice:invoice,updateField:updateField,updateItem:updateItem,addItem:addItem,removeItem:removeItem,clearForm:clearForm,loadInvoice:loadInvoice,editingId:editingId,setEditingId:setEditingId,totals:totals}}>${props.children}<//>`;
}
