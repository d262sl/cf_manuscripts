const startYear = new Date().getFullYear() - 5;
const searchParamsTransplants = new URLSearchParams({
    db: 'pubmed',
    term: `("Lung Transplantation"[Title/Abstract] OR "Lung Transplant"[Title/Abstract]) AND ("Cystic Fibrosis"[Title/Abstract] OR "COPD"[Title/Abstract] OR "Chronic Obstructive Pulmonary Disease"[Title/Abstract]) AND ("${startYear}/01/01"[Date - Publication] : "3000"[Date - Publication])`,
    retmode: 'json',
    retmax: '1000',
    sort: 'pub_date'
});

const url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?' + searchParamsTransplants.toString();
console.log(url);

fetch(url)
    .then(r => r.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
