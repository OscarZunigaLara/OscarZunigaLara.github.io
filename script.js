// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDvTLUjP4t9nhBFijhAKOANm8i8_HmqAPM",
    authDomain: "basetiempo.firebaseapp.com",
    databaseURL: "https://basetiempo.firebaseio.com",
    projectId: "basetiempo",
    storageBucket: "basetiempo.appspot.com",
    messagingSenderId: "837513046464",
    appId: "1:837513046464:web:33f0855f074ddb92a64025",
    measurementId: "G-6N3W7EXH60"
  };
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

//Render table with timer
const timesList = document.querySelector('#time-list');

function renderTime(doc){
    let li = document.createElement('li');
    let time = document.createElement('span');
    let date = document.createElement('span');
    let description = document.createElement('span');
    let cross = document.createElement('div');
    let edit = document.createElement('edit');
    
    li.setAttribute('data-id',doc.id)
    if(doc.data().Minutes < 10){
        time.textContent = doc.data().Hours + ":0" + doc.data().Minutes;
    }else{
        time.textContent = doc.data().Hours + ":" + doc.data().Minutes;
    }
    date.textContent = doc.data().Date;
    description.textContent = doc.data().Description;
    cross.textContent = 'x';
    edit.textContent = 'e';

    li.appendChild(time);
    li.appendChild(date);
    li.appendChild(description)
    li.appendChild(cross);
    li.appendChild(edit);

    timesList.appendChild(li);

    //deleting data
    cross.addEventListener('click', (e)=>{
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        console.log(id);
        db.collection("Project").doc(selected.value).collection("Time").doc(id).delete();
    })

    edit.addEventListener('click',(e)=>{
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        console.log(id)
        var descriptionModified = prompt("Please enter the new description", "");
        if (descriptionModified == null || descriptionModified == ""){
            window.alert("Please write a new description");
        }else{
            db.collection("Project").doc(selected.value).collection("Time").doc(id).update({
                Description: descriptionModified
            });
        }
    })
}

//Select Input with options from DB
var selected = document.getElementById('select_projects');
selected.innerHTML = '';
selected.innerHTML += `
            <option value = "0" selected> Selecciona el proyecto 
            en el que estas trabajando</option>`
db.collection("Project").onSnapshot((querySnapshot) =>{
    querySnapshot.forEach(doc => {
        console.log(`${doc.id} => ${doc.data().Name}`)
        selected.innerHTML += `<option value= "${doc.id}">${doc.data().Name}</option>`
    });
});


//Add Project
if(WEBPAGE == 1){
const inputName = document.querySelector("#name");
const addButton = document.querySelector("#addButton");

addButton.addEventListener("click", (e) =>{
    e.preventDefault();
    db.collection('Project').add({
        Name: inputName.value,
        State: "Active"
    }).then(function(){
        console.log("Se agrego Usuario");
    }).catch(function(error){
        console.log("There was an error: ", error);
    });
    inputName.value = '';
})


//Add Time
const inputHours = document.querySelector("#hourInput");
const inputMinutes = document.querySelector("#minuteInput");
const inputDescription = document.querySelector("#descripcion");
const timeButton = document.querySelector("#timeButton");


timeButton.addEventListener("click", (e) =>{
    e.preventDefault();
    if(parseInt(inputMinutes.value) < 60){
        var today = new Date();
        var date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear(); 
        db.collection('Project').doc(selected.value).collection('Time').add({
            Hours: parseInt(inputHours.value),
            Minutes: parseInt(inputMinutes.value),
            Date: date,
            Description: inputDescription.value
        }).then(function(){
            console.log(date);
        }).catch(function(error){   
            console.log("There was an error: ", error);
        });
        inputMinutes.value = 0;
        inputHours.value = 0;
        inputDescription.value = " ";
    }
    else{
        window.alert("Minutes can not be iqual or greater to 60");
        inputMinutes.value = 0;
    }

})
}

//Changes

const total = document.querySelector('#datetime')
if (WEBPAGE == 0){
    function val(){
        d = selected.value
        timesList.innerHTML = "";
        if(d != 0){
            db.collection('Project').doc(selected.value).collection('Time').orderBy('Date').onSnapshot(snapshot =>{
                let changes = snapshot.docChanges();
                changes.forEach(change => {
                    if(change.type == 'added'){
                        renderTime(change.doc)
                        calculateTime(selected.value)

                    } else if(change.type == 'removed'){
                        let li = timesList.querySelector('[data-id=' + change.doc.id + ']');
                        timesList.removeChild(li);
                        calculateTime(selected.value)
                    }
                    else if(change.type == 'modified'){
                        let li = timesList.querySelector('[data-id=' + change.doc.id + ']');
                        timesList.removeChild(li);  
                        renderTime(change.doc)
                    }
                })
            })
        }
    }
}

//Total time
function calculateTime(project){
    db.collection('Project').doc(project).collection('Time').get().then(snapshot => {
        let total_hours = 0;
        let total_minutes = 0;
    
        snapshot.forEach(doc =>{
            total_hours += doc.data().Hours;
            total_minutes += doc.data().Minutes;
        });
    
        let real_minutes = total_minutes % 60;
        let real_hours = total_hours + Math.floor(total_minutes / 60);
    
        if (real_minutes < 10){
            total.innerHTML = real_hours + ":0" + real_minutes
        }
        else{
            total.innerHTML = real_hours + ":" + real_minutes
        }
    })    
}

