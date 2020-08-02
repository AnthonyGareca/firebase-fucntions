const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendNotificationToFCMTokenNewQuestionary = functions
  .firestore
  .document('questionnaires/{mUid}')
  .onWrite(async (event) => {
    const title = event.after.get('name');
    const content = event.after.get('description');

    let tokensDoc = [];
    let tokensCollection = await admin.firestore().collection('new-questionary-token-list');
    let tokensSnapDoc = await tokensCollection
      .get()
      .then(snapshots => snapshots
        .forEach(doc => {
          tokensDoc.push(doc.data());
        })
      )
      .catch(err => console.log(`Error getting Data: ${err}`));

    var message = {
      notification: {
        title: title,
        body: content,
      },
      token: '',
    };

    tokensDoc.forEach(async doc => {
      message.token = doc.token;
      let response = await admin.messaging().send(message);
      console.log(response);
    })
  });

exports.sendNotificationToFCMTokenNewResponse = functions
  .firestore
  .document('deliveredquestionnaires/{mUid}')
  .onWrite(async (event) => {
    const questionnaireId = event.after.get('questionnaireId');
    const studentId = event.after.get('studentId');
    const questionaryName = await admin.firestore().collection('questionnaires').doc(questionnaireId).get().then(doc => doc.data().name);
    const studentName = await admin.firestore().collection('users').doc(studentId).get().then(doc => doc.data().name);

    let tokensDoc = [];
    let tokensCollection = await admin.firestore().collection('new-response-token-list');
    let tokensSnapDoc = await tokensCollection
      .get()
      .then(snapshots => snapshots
        .forEach(doc => {
          tokensDoc.push(doc.data());
        })
      )
      .catch(err => console.log(`Error getting Data: ${err}`));

    var message = {
      notification: {
        title: `New Response from ${questionaryName}`,
        body: `New response from student ${studentName}`,
      },
      token: '',
    };

    tokensDoc.forEach(async doc => {
      message.token = doc.token;
      let response = await admin.messaging().send(message);
      console.log(response);
    });
  });