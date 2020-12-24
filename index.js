const core = require('@actions/core');
const github = require('@actions/github');
const sendgrid = require('@sendgrid/mail');
let shouldNotify = false;

async function run() {
  try { 
    // set SendGrid API Key
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

    // get all the input variables
    const fromEmail = core.getInput('fromMailAddress');
    const toEmail = core.getInput('toMailAddress');
    let subject = core.getInput('subject');
    const verbose = core.getInput('verbose');
    const subjectPrefix = core.getInput('subjectPrefix');

    if (verbose)
    {
      console.log('TO:' + toEmail);
      console.log('FROM:' + fromEmail);
      console.log('SUBJECT:' + subject);
      console.log('SUBJECT PREFIX:' + subjectPrefix);
    }

    shouldNotify = true;
    if (verbose) console.log('SHOULD NOTIFY: ' + shouldNotify);

    if (shouldNotify) {
      const payload = github.context.payload;
      const issueBodyPlain
        = 'Push of one or more secure files\n\nLink to changes: ' + payload.compare
        + '\nSHA: ' + github.context.sha
        + '\nactor: ' + github.context.actor
        + '\nref: ' + payload.ref
        + '\ngithub workflow:' + github.context.workflow
        + '\nrepository: ' + payload.repository.full_name;
      const issueBodyHtml
          = 'Push of one or more secure files'
          + '<ol>'
          + '<li><a href="' + payload.compare + '">Link to Changes</a></li>'
          + '<li><b>SHA</b>: ' + github.context.sha + '</li>'
          + '<li><b>actor</b>: ' + github.context.actor + '</li>'
          + '<li><b>ref</b>: ' + payload.ref + '</li>'
          + '<li><b>github workflow</b>: ' + github.context.workflow + '</li>'
          + '<li><b>repository</b>: ' + payload.repository.full_name + '</li>'
          + '</ol>';
      const title = 'Push of one or more secure files from ' + payload.repository.full_name;
  
      // construct the subject line
      if (!subjectPrefix.startsWith('__NONCE__')) {
        subject = subjectPrefix + ' ' + title;
      }

      if (verbose) {
        console.log(issueBodyHtml);
      }
      
      const msg = {
        to: toEmail,
        from: fromEmail,
        subject: subject,
        text: issueBodyPlain,
        html: issueBodyHtml
      }

      sendgrid
        .send(msg)
        .then(function () { return console.log('Mail queued successfully'); })["catch"](function (error) { return console.error(error.toString()); });
    }
    else {
      console.log('No matching label was applied');
    }

  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
