
const data=[
{type:'eyes',title:'Morning coffee research continues.',img:'https://picsum.photos/600/400?1',loc:'Pépieux'},
{type:'photo',title:'Sunset over the vineyards.',img:'https://picsum.photos/600/400?2',loc:'Pépieux'},
{type:'comet',text:'I think this village gets quieter every day.'},
{type:'photo',title:'Market day.',img:'https://picsum.photos/600/400?3',loc:'Pépieux'},
{type:'eyes',title:'Walking the old streets.',img:'https://picsum.photos/600/400?4',loc:'Pépieux'},
{type:'comet',text:'Apparently every French village has an amazing bakery.'}
];
const grid=document.getElementById('moments');
data.forEach(m=>{
const d=document.createElement('div');
if(m.type==='comet'){
 d.className='comet';
 d.textContent=m.text;
}else{
 d.className='card';
 const badge=m.type==='eyes'?'👓 Through My Eyes':'📷 Moment';
 d.innerHTML=`<img src="${m.img}"><div class="body"><div class="badge">${badge}</div><h3>${m.title}</h3><small>${m.loc}</small></div>`;
}
grid.appendChild(d);
});
