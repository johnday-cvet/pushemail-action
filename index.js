const core = require('@actions/core');
const github = require('@actions/github');
const sendgrid = require('@sendgrid/mail');
const shouldNotify = true;

/**
 * run
 */
async function run() {
  try { 
    // set SendGrid API Key
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

    // get all the input variables
    const fromEmail = core.getInput('fromMailAddress');
    const toEmail = core.getInput('toMailAddress');
    const verbose = core.getInput('verbose');
    const subjectPrefix = core.getInput('subjectPrefix');

    if (verbose) {
      console.log('TO:' + toEmail);
      console.log('FROM:' + fromEmail);
      console.log('SUBJECT PREFIX:' + subjectPrefix);
    }

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
          + '<li><b>ACTOR</b>: ' + github.context.actor + '</li>'
          + '<li><b>REF</b>: ' + payload.ref + '</li>'
          + '<li><b>GITHUB WORKFLOW</b>: ' + github.context.workflow + '</li>'
          + '<li><b>REPOSITORY</b>: ' + payload.repository.full_name + '</li>'
          + '</ol>';
      let subject = 'Push of one or more secure files from ' + payload.repository.full_name;
  
      // construct the subject line
      if (!subjectPrefix.startsWith('__NONCE__')) {
        subject = subjectPrefix + ' ' + subject;
      }

      if (verbose) {
        console.log('SUBJECT: ' + subject);
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
