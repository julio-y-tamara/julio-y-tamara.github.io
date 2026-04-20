
const init=async()=>{
    const id = new URLSearchParams(window.location.search).get('id');
    const app=document.getElementById("app");

    if(!id){
        app.innerHTML="<h1>No has sido invitado</h1>";
        return;
    }
    const invitacion=await getData(id);   
    
    if(!invitacion){
        app.innerHTML="<h1>No has sido invitado</h1>";
        return;
    }

    if(!invitacion.nombre || invitacion.nombre==""){
        app.innerHTML="<h1>No has sido invitado</h1>";
        return;
    }

    app.innerHTML=pintarInvitacion(invitacion);
}

const getData=async(id)=>{
    const response=await fetch(`https://n8n.servisofts.com/webhook/9b6bbfd9-6099-493d-bd74-ea55f1435990?id=${id}`);
    const data=await response.json();
    return data;
}

const pintarInvitacion=(invitacion)=>{
    
    let html = `<div style="text-align:center">`;
    html += `<div>Nuestra Boda</div>`;

    html += `<div>Hola ${invitacion.nombre}</div>
    <p>Te invitamos a nuestra boda el 20 de mayo de 2024</p>
    `;

    switch(invitacion.estado){
        case "pendiente":
            html+=`<p>Tu invitación está pendiente, por favor confirma tu asistencia</p>`;
            html+=`<button onclick="confirmarAsistencia('${invitacion.row_number}', 'aprobada')">Asistir</button>`;
            html+=`<button onclick="confirmarAsistencia('${invitacion.row_number}', 'rechazada')">No asistiré</button>`;
            break;
        case "aprobada":
            html+=`<p>Gracias por confirmar tu asistencia</p>`;
            break;
        case "rechazada":
            html+=`<p>Lo sentimos, pero decidiste no asistir a nuestra boda</p>`;
            break;
        default:
            break;
    }   

    html += `</div>`;
    return html;
}

const confirmarAsistencia=async(id, estado)=>{

    await fetch(`https://n8n.servisofts.com/webhook/57fff99d-7c3a-401a-84f5-681ef1b022cb`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({id, estado})
    });

    window.location.reload();
}


window.onload=init;