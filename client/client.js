  // method to parse the json response object
  const parseJSON = (xhr, content, form) => {
    if(content.hasChildNodes()){
        content.removeChild(content.firstChild);
    }

    // make sure there is a response
    if(xhr.response) {
      const obj = JSON.parse(xhr.response);
      console.dir(obj);

      // reset mealform to show by default
      const mealForm = document.querySelector("#mealForm");
      mealForm.style.display = 'block';

      const filteredMealForm = document.querySelector("#filteredMealForm");
      filteredMealForm.style.display = 'none';
    
      //if message in response, add to screen
      if(obj.message) {
        console.dir(obj.message);
        if(xhr.status === 400) {
            const p = document.createElement('p');
            p.textContent = `${obj.message}`;
            p.className = "content-warning";
            content.appendChild(p);
        }
      } 

      // if cleared button is clicked, clear everything on the page
      if(obj.cleared) {
        // get meal p tags and clear them
        let mealItems = document.querySelectorAll(".mealText");

        for(let i = 0; i < mealItems.length; i++) {
          mealItems[i].textContent = "";
        }

        // get input stuff and clear them 
        const dayFields = document.querySelectorAll('#dayField');
        const mealTypeFields = document.querySelectorAll('#mealTypeField');

        for(let i = 0; i < dayFields.length; i++) {
          dayFields[i].selectedIndex = 0;
        }

        for(let i = 0; i < mealTypeFields.length; i++) {
          mealTypeFields[i].selectedIndex = 0;
        }

        const titleField = document.querySelector('#titleField');
        titleField.value = "";
      }

      // if all meals returned, print all meals to the page
      if(obj.meals) {
        for(let day in obj.meals){
          for(let meal in obj.meals[day]){
            const mealObj = obj.meals[day][meal];
            const specificDayCard = form.querySelector(`#${mealObj.day.toLowerCase()}`);
            const pTag = specificDayCard.querySelector(`#${mealObj.mealType.toLowerCase()}`);
          
            pTag.textContent = ` ${mealObj.title}`;
          }
        }
      }

      // if one meal returned, print meal data to page
      if(obj.meal){
        const day = obj.meal.day;
        const mealType = obj.meal.mealType;

        const specificDayCard = form.querySelector(`#${day.toLowerCase()}`);
        const pTag = specificDayCard.querySelector(`#${mealType.toLowerCase()}`);

        if(xhr.status === 201){
            pTag.textContent += ` ${obj.meal.title}`;
        }
        else if(xhr.status === 200){
            pTag.textContent = ` ${obj.meal.title}`;
        }
      }

      // if filtered by specific day and/or meal type
      if(obj.filteredBy) {
        const mealForm = document.querySelector("#mealForm");
        mealForm.style.display = 'none';

        const filteredMealForm = document.querySelector("#filteredMealForm");
        filteredMealForm.style.display = 'block';

        const div = document.getElementById('filteredMealDiv');
        div.innerHTML = '';

        // set the title for the meal (show day or meal type that was queried by)
        const title = document.createElement('h3');
        title.textContent = 'Meals'
        div.appendChild(title);

        if(obj.filteredBy === 'meal'){
          title.textContent += ` - ${obj.mealType}`;
        }
        else if(obj.filteredBy === 'day'){
          title.textContent += ` - ${obj.day}`;
        }

        // loop over the list of filtered meals and add them to the page
        for (let meal in obj.filteredMeals){
          const titleTag = document.createElement('p');
          const mealTag = document.createElement('p');
          const br = document.createElement('br');
          const br2 = document.createElement('br');

          meal = meal.split(' ').join('');

          titleTag.className = 'mealTitle';
          mealTag.className = 'mealText';

          // set the titles and meal tags based on how it was queried 
          if(obj.filteredBy === 'meal'){
            titleTag.textContent = `${obj.filteredMeals[meal].day}: `;
            mealTag.textContent = obj.filteredMeals[meal].mealTitle;
          }
          else if(obj.filteredBy === 'day'){
            titleTag.textContent = `${obj.filteredMeals[meal].mealType}: `;
            mealTag.textContent = obj.filteredMeals[meal].mealTitle;
          }
          else if(obj.filteredBy === 'both') {
            titleTag.textContent = `${obj.filteredMeals[meal].day}, ${obj.filteredMeals[meal].mealType}: `;
            mealTag.textContent = obj.filteredMeals[meal].mealTitle;
          }

          // append everything to the card
          div.appendChild(titleTag);

          if(obj.filteredBy === 'both'){
            div.appendChild(br2);
          }

          div.appendChild(mealTag);
          div.appendChild(br);
        }
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
    const url = form.getAttribute('action');

    // variables for request
    let data = '';
    let params = '';

    let dayField = form.querySelector('#dayField');
    let mealTypeField = form.querySelector('#mealTypeField');

    if(method === 'post'){  
      // get data to send
      const titleField = form.querySelector('#titleField');
      data = `title=${titleField.value}&mealType=${mealTypeField.options[mealTypeField.selectedIndex].value}&day=${dayField.options[dayField.selectedIndex].value}`;
    } 
    else if(method === 'get') {
      if(url === '/searchMeals'){
        params = `?mealType=${mealTypeField.options[mealTypeField.selectedIndex].value}&day=${dayField.options[dayField.selectedIndex].value}`;
      }
    }

    // send request
    const xhr = new XMLHttpRequest();
    xhr.open(method, url + params);
    xhr.setRequestHeader("Accept", 'application/json');
    xhr.onload = () => handleResponse(xhr, method);
    xhr.send(data);

    return false;
  };

  // function to get the initial data
  const initialGet = (method, url) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader("Accept", 'application/json');
    xhr.onload = () => handleResponse(xhr, method);
    xhr.send();
  };

  // initialization
  const init = () => {
    // get all forms
    const addMealForm = document.querySelector("#addMealForm");
    const mealForm = document.querySelector("#mealForm");
    const searchMealsForm = document.querySelector("#searchMealsForm");
    const clearMealsForm = document.querySelector("#clearMealsForm");

    // ajax setup
    let addMeal = (e) => sendAjax(e, addMealForm);
    let getMeals = (e) => sendAjax(e, mealForm);
    let searchMeals = (e) => sendAjax(e, searchMealsForm);
    let clearMeals = (e) => sendAjax(e, clearMealsForm);

    // add the listeners for different events
    addMealForm.addEventListener('submit', addMeal);
    mealForm.addEventListener('submit', getMeals);
    searchMealsForm.addEventListener('submit', searchMeals);
    clearMealsForm.addEventListener('submit', clearMeals);

    // get data on init
    initialGet('GET', '/getMeals');
  };

  // load window
  window.onload = init;