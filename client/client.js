// method to parse the json response object
const parseJSON = (xhr, content, form) => {
    if(content.hasChildNodes()){
        content.removeChild(content.firstChild);
    }

    if(xhr.response) {
      const obj = JSON.parse(xhr.response);
      console.dir(obj);
    
      //if message in response, add to screen
      if(obj.message) {
        console.dir(obj.message);
        if(xhr.status === 400){
            const p = document.createElement('p');
            p.textContent = `${obj.message}`;
            p.className = "content-warning";
            content.appendChild(p);
        }
      } 

      if(obj.meal){
        const day = obj.meal.day;
        const mealType = obj.meal.mealType;

        const specificDayCard = form.querySelector(`#${day.toLowerCase()}`);
        const pTag = specificDayCard.querySelector(`#${mealType.toLowerCase()}`);

        if(xhr.status === 201){
            pTag.textContent += ` ${obj.meal.title}`;
        }
        else if(xhr.status === 200){
            // var mealTypeDesc = pTag.textContent.split(":");
            // pTag.textContent = "";
            // pTag.textContent += `${mealTypeDesc[0]}: ${obj.meal.title}`;
            pTag.textContent = ` ${obj.meal.title}`;
        }
      }
    
      //if users in response, add to screen
      if(obj.users) {
        console.dir(obj.users);
        const userList = document.createElement('p');
        const users = JSON.stringify(obj.users);
        userList.textContent = users;
        content.appendChild(userList);
      }
    }
  };

  // list of status titles to print to the screen
  const statusTitles = {
    200: `<b>Success</b>`,
    201: `<b>Create</b>`,
    204: `<b>Updated (no content)</b>`,
    400: `<b>Bad Request</b>`,
    404: `<b>Resource Not Found</b>`,
    default: `<b>Success</b>`
  }

  // handles the response and printing it to the page
  const handleResponse = (xhr, method) => {
    const content = document.querySelector('#content');
    const form = document.querySelector('#mealForm');

    if (statusTitles[xhr.status]){
      console.dir(statusTitles[xhr.status]);
    } else {
      console.dir(statusTitles.default);
    }

    parseJSON(xhr, content, form);
  };
  
  // send ajax
  const sendAjax = (e, form) => {
    //cancel browser's default action
    e.preventDefault();

    // get the method from the form
    const method = form.getAttribute('method');

    // variables for request
    let url = '/';
    let methodSelect = method;
    let data = '';

    if(method === 'post'){  
      url = form.getAttribute('action');

      // get data to send
      const titleField = form.querySelector('#titleField');
      const dayField = form.querySelector('#dayField');
      const mealTypeField = form.querySelector('#mealTypeField');
      data = `title=${titleField.value}&mealType=${mealTypeField.options[mealTypeField.selectedIndex].value}&day=${dayField.options[dayField.selectedIndex].value}`;

      // const dateField = form.querySelector('#dateField');
      // data = `title=${titleField.value}&date=${dateField.value}`;
    } 
    else if(method === 'get') {
      // get selected url and method
      url = document.querySelector('#urlField').value;
      methodSelect = document.querySelector('#methodSelect').value.toUpperCase();
    }

    // send request
    const xhr = new XMLHttpRequest();
    xhr.open(methodSelect, url);
    xhr.setRequestHeader("Accept", 'application/json');
    xhr.onload = () => handleResponse(xhr, methodSelect);
    xhr.send(data);

    return false;
  };

  // initialization
  const init = () => {
    const addMealForm = document.querySelector("#addMealForm");
    const mealForm = document.querySelector("#mealForm");

    let addMeal = (e) => sendAjax(e, addMealForm);
    let getMeals = (e) => sendAjax(e, mealForm);

    addMealForm.addEventListener('submit', addMeal);
    mealForm.addEventListener('submit', getMeals);
  };

  window.onload = init;