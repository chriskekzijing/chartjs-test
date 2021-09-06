let postsApi = "https://jsonplaceholder.typicode.com/posts";
let usersApi = "https://jsonplaceholder.typicode.com/users";
let loading = document.getElementById("loading");
let error = document.getElementById("error");
let postList = document.querySelector(".chart-test_post-details");
let postDetailsHeader = document.querySelector(".chart-test_post-header");
let userDetailsHeader = document.querySelector(".chart-test_post-user");
let btn = document.querySelector(".chart-test_post-button");
let btnCollapse = document.querySelector(".chart-test_post-button-collapse");
let sortedData = [];
let defaultId = 1;

const groupBy = (key) => (array) => {
  return array.reduce((objectsByKeyValue, obj) => {
    const id = obj[key];
    objectsByKeyValue[id] = (objectsByKeyValue[id] || []).concat(obj);
    return objectsByKeyValue;
  }, {});
};

//get users data
async function getUser() {
  try {
    loading.style.display = "block";
    let response = await fetch(usersApi);
    if (!response.ok) return null;
    let usersArray = await response.json();
    loading.style.display = "none";
    error.style.display = "none";
    return usersArray;
  } catch (error) {
    loading.style.display = "none";
    error.style.display = "none";
    alert(error.message);
  }
}

//get post data
async function getPosts() {
  try {
    loading.style.display = "block";
    let response = await fetch(postsApi);
    if (!response.ok) return null;
    let postsArray = await response.json();
    loading.style.display = "none";
    error.style.display = "none";
    return postsArray;
  } catch (error) {
    loading.style.display = "none";
    error.style.display = "none";
    alert(error.message);
  }
}

// get datas
(async function getData() {
  let body = document.getElementById("wrapper");

  let usersData = await getUser();
  let postsData = await getPosts();

  if (usersData && postsData) {
    let dataObject = {
      usersData,
      postsData,
    };
    updateTotalPost(postsData.length);

    const labels = dataObject.usersData.map((user) => user.id);
    let groupByUserId = await groupBy("userId");
    let postsObjects = await groupByUserId(dataObject.postsData);
    let postsArraySorted = Object.values(postsObjects);
    sortedData = postsArraySorted;

    chart(postsArraySorted, labels, usersData);
  } else {
    body.style.display = "none";
    error.style.display = "block";
    let errorHtml = `<h3>Error occurred, please reload or email me through chrisartbp@gmail.com. Thank you :)</h3>`;
    error.insertAdjacentHTML("afterbegin", errorHtml);
  }
})();

// loop through data to generate html
function arrayToString(data) {
  var string = "";
  data.map((post) => {
    let div = `<div class="chart-test_post-card">
                <h3>Id: ${post.id}</h3>
                <h4>
                ${post.title}
                </h4>
                <p>
                 ${post.body}
                </p>
            </div>`;
    string += div;
  });
  return string;
}

//chart start
async function chart(postsArraySorted, labels, usersData) {
  let dataArray = [];

  postsArraySorted.map((post) => {
    dataArray.push({
      x: post[0].userId,
      y: post.length,
      posts: post.reverse(),
      user: usersData.find((user) => user.id === post[0].userId),
    });
  });

  //set default post and title
  function defaultPostsList() {
    let defaultData = dataArray[0].posts.slice(0, 5);
    let defaultUser = dataArray[0].user;
    let listString = arrayToString(defaultData);
    let userHeaderString = `
              <h3>User Details</h3>
              <p><strong>Name:</strong> ${defaultUser?.name}</p>
              <p><strong>Email:</strong>  ${defaultUser?.email}</p>
              <p><strong>Phone:</strong>  ${defaultUser?.phone}</p>
              <p><strong>City:</strong>  ${defaultUser?.address?.city}</p>
              <p><strong>Website:</strong>  ${defaultUser?.website}</p>
              `;
    postList.insertAdjacentHTML("afterbegin", listString);
    userDetailsHeader.insertAdjacentHTML("afterbegin", userHeaderString);
  }
  defaultPostsList();

  function clickOnChart(dataIndex) {
    //reset title and cards
    postList.innerHTML = "";
    userDetailsHeader.innerHTML = "";
    btnCollapse.style.display = "none";
    btn.style.display = "inline-block";

    let userId = dataIndex[0]?.element?.$context?.raw.x;
    let data = dataIndex[0]?.element?.$context?.raw?.posts;
    let user = dataIndex[0]?.element?.$context?.raw?.user;
    defaultId = userId;
    let listString = arrayToString(data.slice(0, 5));

    let userHeaderString = `
              <h3>User Details</h3>
              <p><strong>Name:</strong> ${user?.name}</p>
              <p><strong>Email:</strong> ${user?.email}</p>
              <p><strong>Phone:</strong> ${user?.phone}</p>
              <p><strong>City:</strong> ${user?.address?.city}</p>
              <p><strong>Website:</strong> ${user?.website}</p>
              `;

    if (data) {
      postList.insertAdjacentHTML("afterbegin", listString);
      userDetailsHeader.insertAdjacentHTML("afterbegin", userHeaderString);
    } else {
      defaultPostsList();
    }
  }

  const footer = (tooltipItems) => {
    let user = tooltipItems[0]?.raw?.user;
    let div = `Website: ${user?.website}`;
    return div;
  };

  //chart config
  const config = {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Posts",
          data: dataArray,
          backgroundColor: [
            "#7cd9e2",
            "#71d0e1",
            "#69c6e0",
            "#63bcdf",
            "#60b3dd",
            "#61a9d9",
            "#649fd3",
            "#4c8dc6",
            "#367bb9",
            "#286eac",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "User Id",
          },
        },
      },
      onClick: function (e, items) {
        if (items.length == 0) return;
        clickOnChart(items, (viewmore = true));
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            footer: footer,
          },
        },
      },
    },
  };

  //create chart
  let chart = new Chart(document.getElementById("chart"), config);
}
//chart end

// update total post div start
function updateTotalPost(number) {
  let titleString = `<h1>Total ${number} Posts</h1> `;

  let totalPost = document.querySelector(".chart-test_left-posts");
  totalPost.insertAdjacentHTML("afterbegin", titleString);
}

// click view more button
function handleClickViewMore() {
  let data = sortedData[defaultId - 1].slice(5);
  let listString = arrayToString(data);
  postList.insertAdjacentHTML("beforeend", listString);
  btn.style.display = "none";
  btnCollapse.style.display = "inline-block";
}

// click collapse button
function handleClickCollapse() {
  let data = sortedData[defaultId - 1].slice(0, 5);
  btnCollapse.style.display = "none";
  btn.style.display = "inline-block";
  let listString = arrayToString(data);
  postList.innerHTML = listString;
}
