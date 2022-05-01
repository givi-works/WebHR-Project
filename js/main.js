const route = (event) => { 
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    handleLocation();
    
    
};

const routes = {
    404: "/pages/404.html",
    "/": "/pages/myip.html",
    "/tasks": "/pages/tasks.html",
};

const handleLocation = async () => {
    const path = window.location.pathname;
    const route = routes[path] || routes[404];
    const html = await fetch(route).then((data) => data.text());
    document.getElementById("main-page").innerHTML = html;

    if (route.includes('myip')){
        const ipres = await fetch('https://api.db-ip.com/v2/free/self')
        const ipdata = await ipres.json() 
        const ipContainer = document.querySelector('.myip')
        const ipCity = document.querySelector('.city')
        ipContainer.innerHTML = ipdata.ipAddress
        ipCity.innerHTML = ipdata.city
    }

    if (route.includes('tasks')){
        const input = document.querySelector("#newTaskInput");
        const form = document.querySelector("#addNewTask");
        const listPlace = document.getElementById('task_list')
        const btalert = document.getElementById('alert')

        const response = await fetch("http://localhost:5000/tasks");
        const data = await response.json()
               
        function showAlert(alertText) { 
            btalert.style.display = 'block';
            btalert.style.opacity = 1;
            btalert.innerHTML = alertText;

            setTimeout(function(){ 
                btalert.style.opacity = 0;  
            }, 500)

            setTimeout(function(){ 
                btalert.style.display = 'none';  
            }, 1000)
        }
    
        function showTasks() {
            data.map((task) => { 
                const mainDiv = document.createElement('div')
                mainDiv.classList.add("temp")
                mainDiv.classList.add("card")
    
                const taskDiv = document.createElement('div')
                taskDiv.classList.add("singleTask")
                taskDiv.classList.add('card-body')
                taskDiv.setAttribute('id', task.id)
                mainDiv.appendChild(taskDiv)
                
                const taskInput = document.createElement('textarea')
                taskInput.classList.add('form-control-plaintext')
                taskInput.type = 'text'
                taskInput.value = task.taskName
                taskInput.setAttribute('readonly', 'readonly')
                taskDiv.appendChild(taskInput)

                const buttonDivs = document.createElement('div')
                buttonDivs.classList.add('btn-group')
                taskDiv.appendChild(buttonDivs)

                const editButton = document.createElement('button')
                editButton.setAttribute('type', 'button')
                editButton.classList.add("btn")
                editButton.classList.add("btn-warning")
                editButton.innerHTML = 'Edit'
                buttonDivs.appendChild(editButton)
    
                const deleteButton = document.createElement('button')
                deleteButton.setAttribute('type', 'button')
                deleteButton.classList.add("btn")
                deleteButton.classList.add("btn-danger")
                deleteButton.innerHTML = 'Delete'
                buttonDivs.appendChild(deleteButton)           
                    
                listPlace.appendChild(mainDiv)
                

                editButton.addEventListener('click', (e) => {
                    if (editButton.innerText.toLowerCase() == "edit") {
                        editButton.innerText = "Save";
                        taskInput.removeAttribute("readonly");
                        taskInput.focus();
                    } else {
                        
                        const newValue = taskInput.value;

                        const taskId = (e.composedPath()[2]).getAttribute("id")
                        if (newValue.length > 0) { 
                            editButton.innerText = "Edit";
                            taskInput.setAttribute("readonly", "readonly");
                            var myHeaders = new Headers();
                            myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

                            var urlencoded = new URLSearchParams();
                            urlencoded.append("taskName", newValue);

                            var requestOptions = {
                                method: 'PUT',
                                headers: myHeaders,
                                body: urlencoded,
                                redirect: 'follow'
                            };

                            fetch(`http://localhost:5000/tasks/${taskId}`, requestOptions)
                            .then(response => response.text())
                            .then(result => console.log(result))
                            .catch(error => console.log('error', error));
                            showAlert("Task has been edited succesfully")
                            } else { 
                                showAlert("Can't be empty")
                            }
                        } 
                        
                    });
                    deleteButton.addEventListener('click', (e) => {
                        mainDiv.removeChild(taskDiv);
                        mainDiv.classList.remove('card')
                        const elementID = (e.composedPath()[2]).getAttribute("id")
                        for( var i = 0; i < data.length; i++){ 
                            if ( data[i].id == elementID) { 
                                data.splice(i, 1); 
                            }
                        }
                        showAlert("Task deleted succesfully")
                        fetch (`http://localhost:5000/tasks/${elementID}`, {method: 'DELETE'})
                    });
                })
            }
            form.addEventListener('submit', (e) => {    
                e.preventDefault();
                const task = input.value;
                if ((input.value).length > 0) { 
                    var myHeaders = new Headers();
                    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    
                    var urlencoded = new URLSearchParams();
                    urlencoded.append("taskName", task);
    
                    var requestOptions = {
                        method: 'POST',
                        headers: myHeaders,
                        body: urlencoded,
                        redirect: 'follow'
                    };
                    fetch("http://localhost:5000/tasks", requestOptions)
                    .then(response => response.text())
                    .then(result => result)
                    .catch(error => console.log('error', error));
                    
                
                    const temp = document.querySelectorAll('.temp');
                    temp.forEach(element => {
                        element.remove()
                    });
                    data.push({
                        taskName: task,
                        id: data.length>0 ? data[data.length-1].id+1 : 1 
                    })
                    showAlert("New task added succesfully")
                    
                    showTasks()
                    input.value = '';
                } else { 
                    showAlert("Please type your task")
                }
    
            })
            showTasks()
    }
    
};

window.onpopstate = handleLocation;
window.route = route;

handleLocation();