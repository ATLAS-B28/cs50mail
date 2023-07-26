document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);
  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

//open the email
function open_email(id) {
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      //for every email
      document.querySelector("#emails-view").style.display = "none";
      document.querySelector("#compose-view").style.display = "none";
      document.querySelector("#email-detail-view").style.display = "block";
      //now in this add the following html
      document.querySelector("#email-detail-view").innerHTML = `
     <ul class="list-group"> 
     <li class="list-group-item"><b>From:</b> <span>${email["sender"]}</span></li>
     <li class="list-group-item"><b>To: </b><span>${email["recipients"]}</span></li>
     <li class="list-group-item"><b>Subject:</b> <span>${email["subject"]}</span</li>
     <li class="list-group-item"><b>Time:</b> <span>${email["timestamp"]}</span></li>
     <li class="list-group-item"><br/>${email["body"]}</li>
     </ul>
     `;
      //add read or not
      if (!email["read"]) {
        fetch("/emails/" + email["id"], {
          method: "PUT",
          body: JSON.stringify({ read: true }),
        });
      }
      //reply functionality
      const reply = document.createElement("button");
      reply.className = "btn btn-primary m2";
      reply.innerHTML = "Reply";
      reply.addEventListener("click", function () {
        compose_email(); //call the compose email
        //and fill the recipient with sender's name and the subject
        document.querySelector("#compose-recipients").value = email["sender"];
        let subject = email["subject"];
        if (subject.split(" ", 1)[0] != "Re:") {
          subject = "Re: " + subject;
        }
        document.querySelector("#compose-subject").value = subject;
        let body = `
       On ${email["timestamp"]} , ${email["sender"]} wrote: ${email["body"]}
      `;
        document.querySelector("#compose-body").value = body;
      });
      document.querySelector("#email-detail-view").appendChild(reply);
      //archive button
      archBtn = document.createElement("button");
      archBtn.className = "btn btn-secondary m-1";
      archBtn.innerHTML = !email["archived"] ? "Archive" : "Unarchive";
      archBtn.addEventListener("click", function () {
        fetch("/emails/" + email["id"], {
          method: "PUT",
          body: JSON.stringify({ archived: !email["archived"] }),
        }).then((response) => load_mailbox("inbox"));
      });
      document.querySelector("#email-detail-view").append(archBtn);
    })
    .catch(error => console.log("Error: ",error))
}

//in loading mailbox and show emails view
//fetch the emails and create a div and have sender ,subject and timestamp
//add an even t listener and call function to open mail
function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
   //get request of the 'sent'
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      //get the eamils
      //for email create a div to present the mail body
      emails.forEach((email) => {
        let new_div = document.createElement("div");
        //add class name  of email read not read
        new_div.className = email["read"]
          ? "email-box-not-read"
          : "email-box-read";
        new_div.innerHTML = `
      <span class="sender-email"> <strong>${email["sender"]}</strong> </span>
      <span class="subject-email"> ${email["subject"]} </span>
      <span class="timestamp-email"> ${email["timestamp"]} </span>
    `;
        //add event listener to open
        new_div.addEventListener("click", () => open_email(email["id"]));
        document.querySelector("#emails-view").appendChild(new_div);
      });
    })
    .catch((error) => console.log("Error: ", error));
}

//here we have header and then send the response
function send_email(e) {
  e.preventDefault();
  console.log("hi");
  //want a new email and send to person
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;
  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
  })
    .then((response) => response.json())
    .then((result) => console.log(result))
    .catch((error) => console.log(error));
  load_mailbox("sent");
}
