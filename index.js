// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const {LinkOutSuggestion, Suggestions} = require('actions-on-google');
//const app = dialogflow();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  console.log('lang: ' + request.body.queryResult.languageCode);
  console.log('queryText: ' + request.body.queryResult.queryText);
  const lang = request.body.queryResult.languageCode;
  console.log('agent intent: ' + agent.intent);
  console.log('agent action: ' + agent.action);
  console.log('agent requestSource: ' + agent.requestSource);
  console.log('Dialogflow queryText: ' + JSON.stringify(request.body.queryResult.queryText));   
 
  function welcome(agent) {
      //if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {}
    if(lang == "de"){
        agent.add(`Willkommen beim BMJ-Agenten!`);
        agent.add(new Card({
             title: `BMJ`,
             imageUrl: 'https://resources.bmj.com/repository/images/bmj-logo.png',
             text: `etwas Text`,
             buttonText: 'Besuchen Sie BMJ Best Practice',
             buttonUrl: 'https://bestpractice.bmj.com'
           })
         );
        agent.add('Sagen Sie "Thema"'); 
    } else {
        agent.add(`Welcome to BMJ agent!`);
        agent.add(new Card({
             title: `BMJ`,
             imageUrl: 'https://resources.bmj.com/repository/images/bmj-logo.png',
             text: `some text`,
             buttonText: 'Visit BMJ Best Practice',
             buttonUrl: 'https://bestpractice.bmj.com'
           })
         );
        agent.add('Say "topic"'); 
    }
  }
 
  function fallback(agent) {
    if(lang == "de"){
		agent.add(`Ich habe es nicht verstanden`);
		agent.add(`Entschuldigung, können Sie es noch einmal versuchen?`);
	}else{
		agent.add(`I didn't understand`);
		agent.add(`I'm sorry, can you try again?`);
	}
  }

  function nameHandler(agent) {
    if(lang == "de"){
		agent.add('Ich bin dein BMJ-Agent!');
	}else{
		agent.add('I am your BMJ agent!');
	}
  }

function topicHandler(agent) {
    console.log("topic");
    if(lang == "de"){
        console.log("ein Thema vorschlagen");
	    agent.add('ein Thema vorschlagen');
	}else{
	    console.log("suggest a topic");
	    if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
		    let conv = agent.conv();
		    conv.ask('name your topic');
		    agent.add(conv);
	    } else {
		agent.add('suggest a topic');
	    }
	}
}
         
function specialtiesHandler(agent) {
    const specialty = agent.parameters.specialty;
    console.log(`specialty: ${specialty}`);
    if(lang == "de"){
	    agent.add('ein Thema vorschlagen');
	}else{
		if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
		    let conv = agent.conv();
		    conv.ask(`asked for ${specialty}`);
			conv.ask(new LinkOutSuggestion({
              name: `${specialty}`,
              url: `${getUrl(specialty)}`
            }));
            agent.add(conv);
		}else {	
		    agent.add(`asked for ${specialty}`);
            agent.add(new Card({
                title: `BMJ`,
                buttonText: `${specialty}`,
                buttonUrl: getUrl(specialty)
            }));
		}
	}
}


function getUrl(specialty) {
    return 'https://bestpractice.bmj.com/specialties/3';
}

function treatmentHandler(agent) {
    console.log('treatmentHandler');
    const topics = agent.parameters.topics;
    const topicsPartial = agent.parameters.topicsPartial;
    console.log(`topics:- ${topics}`);
    console.log(`topicsPartial:- ${topicsPartial}`);
    
    if(topics) {
        if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
            let conv = agent.conv();    
            conv.ask('Do you want treatment approach or treatment algorithm?');
             conv.ask(new Suggestions(['treatment approach','treatment algorithm']));
             agent.add(conv);
        } else {
            agent.add('Do you want treatment approach or treatment algorithm?');
            agent.add(new Suggestion('treatment approach'));
            agent.add(new Suggestion('treatment algorithm'));
        }
        agent.context.set({
            name: 'treatment-choice',
            lifespan: 5,
            parameters:{topics: topics}
        });
        
    } else {
        if(topicsPartial) {
            console.log(`topicsPartial ${topicsPartial}`);
            agent.add(`You entered ${topicsPartial}`);
            agent.add(new Suggestion('unstable angina'));
	    } else {
	        agent.add('provide a valid topic name');
	    }
    }   
}

function diagnosisHandler(agent) {
    console.log('diagnosisHandler');
    const topics = agent.parameters.topics;
    const topicsPartial = agent.parameters.topicsPartial;
    console.log(`topics:- ${topics}`);
    console.log(`topicsPartial:- ${topicsPartial}`);
    
    if(topics) {
        if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
            let conv = agent.conv();    
            conv.ask('Optimal care for patients presenting with chest pain suggestive of UA includes accurate and timely diagnosis utilising a combination of clinical, ECG, and laboratory markers, leading to shorter times to appropriate therapy.');
            conv.ask('There are further details available ');
             conv.ask(new Suggestions(['History','Examination', 'ECG','Invasive strategies']));
             agent.add(conv);
        } else {
            agent.add('Optimal care for patients presenting with chest pain suggestive of UA includes accurate and timely diagnosis utilising a combination of clinical, ECG, and laboratory markers, leading to shorter times to appropriate therapy.');
            agent.add('There are further details available ');
            agent.add(new Suggestion('History'));
            agent.add(new Suggestion('Examination'));
            agent.add(new Suggestion('ECG'));
            agent.add(new Suggestion('Cardiac biomarkers'));
        }
        agent.context.set({
            name: 'diagnosis-followup',
            lifespan: 5,
            parameters:{topics: topics}
        });
        //agent.setFollowupEvent('diagnosis-event');agent.setFollowupEvent({ "name": "CUSTOMER_NAME_REQUESTED", "parameters" : { "received": "false"}});
    } else {
        if(topicsPartial) {
            console.log(`topicsPartial ${topicsPartial}`);
            agent.add(`You entered ${topicsPartial}`);
            agent.add(new Suggestion('unstable angina'));
	    } else {
	        agent.add('provide a valid topic');
	    }
    }   
}
         
function treatmentAlgorithmHandler(agent) {
    console.log('treatmentAlgorithmHandler');
    const treatmentAlgorithmContext = agent.context.get('treatment-choice');
    const topics = treatmentAlgorithmContext.parameters.topics;
    const section = request.body.queryResult.queryText;
    console.log('treatmentAlgorithmHandler queryText: ' + request.body.queryResult.queryText);
    console.log(`topics: ${topics}`);
    //agent.add(`asked for ${topics}!`);
    
    if(section != 'treatment algorithm') {
        if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
            let conv = agent.conv();
            conv.ask(`Main treatment is rest, plus evaluating and correcting over-training errors.  Physiotherapy starts with stretching to improve range of motion followed by strengthening of the rotator cuff muscles and scapular stabilisers 2 or 3 times per week for 6 weeks. May need multiple courses...`);
    		        conv.ask(new LinkOutSuggestion({
                        name: `shoulder with biceps`,
                        url: `https://bestpractice.bmj.com/topics/en-gb/582/treatment-algorithmh#shoulder_with_biceps_tendinopathy`
            }));
            agent.add(conv);   
        } else {
		    agent.add(`Main treatment is rest, plus evaluating and correcting over-training errors.  Physiotherapy starts with stretching to improve range of motion followed by strengthening of the rotator cuff muscles and scapular stabilisers 2 or 3 times per week for 6 weeks. May need multiple courses...`);
            agent.add(new Card({
                 title: `${topics}`,
                 buttonText: 'shoulder with biceps',
                 buttonUrl: 'https://bestpractice.bmj.com/topics/en-gb/582/treatment-algorithmh#shoulder_with_biceps_tendinopathy'
               }));
        }
    } else {
        agent.add(`${topics} asked for ${section}. Enter patient group, options below.`);
        agent.add(`shoulder with rotator cuff tendinopathy,  shoulder with biceps tendinopathy,  elbow with lateral epicondylitis,  elbow with medial epicondylitis, knee with patella tendinopathy, knee with quadriceps iliotibial band or popliteus tendinopathy, ankle with Achilles' tendinopathy`);
    }
    
}

function treatmentApproachHandler(agent) {
    console.log('treatmentApproachHandler');
    const treatmentApproachContext = agent.context.get('treatment-choice');
    const topics = treatmentApproachContext.parameters.topics;
    const section = request.body.queryResult.queryText;
    console.log('treatmentApproachHandler queryText: ' + request.body.queryResult.queryText);
    console.log(`topics: ${topics}`);
    agent.add(`asked for ${topics}!`);

}


function diagnosisCustomHandler(agent) {
    console.log('diagnosisCustomHandler');
    const diagnosisContext = agent.context.get('diagnosis-followup');
    const topics = diagnosisContext.parameters.topics;
    const section = request.body.queryResult.queryText;
    console.log('diagnosisCustomHandler queryText: ' + request.body.queryResult.queryText);
    console.log(`topics: ${topics}`);
    if(lang == "de"){
	}else{
		if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
		    let conv = agent.conv();
		    if(section == 'ECG') {
		        conv.ask(`Current guidelines recommend that an ECG be obtained and interpreted by a qualified physician within the first 10 minutes after a patient presents with chest pain...`);
		        conv.ask(new LinkOutSuggestion({
                    name: `ecg`,
                    url: `https://bestpractice.bmj.com/topics/en-gb/149/diagnosis-approach#ecg`
                }));
		    } else {
		        conv.ask(`Typical features include age >45 years; smoker; with long-standing hypertension, diabetes, or hypercholesterolaemia. A history of peripheral vascular disease or pre-existing heart disease should be determined...`);
		        conv.ask(new LinkOutSuggestion({
                    name: `history`,
                    url: `https://bestpractice.bmj.com/topics/en-gb/149/diagnosis-approach#history`
                }));
		    }
            agent.add(conv);
		}else {	
		    if(section == 'ECG') {
		    agent.add(`asked for ${section}!Current guidelines recommend that an ECG be obtained and interpreted by a qualified physician within the first 10 minutes after a patient presents with chest pain...`);
            agent.add(new Card({
                 title: `${topics}`,
                 buttonText: 'ecg',
                 buttonUrl: 'https://bestpractice.bmj.com/topics/en-gb/149/diagnosis-approach#ecg'
               }));
		    } else {
		    agent.add(`asked for ${section}!Current guidelines recommend that an ECG be obtained and interpreted by a qualified physician within the first 10 minutes after a patient presents with chest pain...`);
            agent.add(new Card({
                 title: `${topics}`,
                 buttonText: 'history',
                 buttonUrl: 'https://bestpractice.bmj.com/topics/en-gb/149/diagnosis-approach#history'
               }));
		    }
		}
	}           
}

function overviewHandler(agent) {
    console.log('overviewHandler');
    const topics = agent.parameters.topics;
    if(topics == 'blast crisis') {
        getBlastOverview(agent);
    }else{
        getMaleOverview(agent);
    }
}

function preventionHandler(agent) {
    const topics = agent.parameters.topics;
    const topicSection = agent.parameters.topicSection;
    console.log(`topics: ${topics}`);
    console.log(`topicSection: ${topicSection}`);
    if(lang == "de"){
	    agent.add('ein Thema vorschlagen');
	}else{
	    if(topics == 'Testicular torsion') {
	        getTesticularPrevention(agent);  
	    }else{
	        getGuillianPrevention(agent);
	    }
	}
}


function searchHandler(agent) {
    console.log('queryText: ' + request.body.queryResult.queryText);
    const topics = agent.parameters.topics;
    const topicSection = agent.parameters.topicSection;
    console.log(`topics: ${topics}`);
    console.log(`topicSection: ${topicSection}`);
    if(lang == "de"){
		agent.add('Zu den häufigsten Symptomen, die zwischen dem Beginn der <em> Symptome </ em> und dem Erkennen von Fällen beim Ausbruch von 2014 berichtet wurden, gehörten: Fieber (87,1% bis 89%), Müdigkeit (76,4%), Appetitlosigkeit (64,5%), Erbrechen (67,6%) Durchfall');
		agent.add(new Card({
             title: `BMJ`,
             buttonText: 'Ebola-Virus-Infektion',
             buttonUrl: 'https://bestpractice.bmj.com/topics/en-gb/1210/diagnosis-approach'
           })
        );
	}else{
		if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
		    let conv = agent.conv();
		    if(topicSection) {
		      conv.ask(`presence of risk factors`);  
		      conv.ask(`fever`);  
		    } else {
		    conv.ask(`The most commonn symptoms reported between the onset of symptoms and case detection in the 2014 outbreak included: fever (87.1% to 89%), fatigue (76.4%), loss of appetite (64.5%), vomiting (67.6%), diarrhoea`);
			}
			conv.ask(new LinkOutSuggestion({
              name: 'ebola',
              url: 'https://bestpractice.bmj.com/topics/en-gb/1210/diagnosis-approach'
            }));
            agent.add(conv);
		} else {
		    if(topicSection) {
		      agent.add(`presence of risk factors`);  
		      agent.add(`fever`);  
		    } else {
			agent.add('The most commonn symptoms reported between the onset of symptoms and case detection in the 2014 outbreak included: fever (87.1% to 89%), fatigue (76.4%), loss of appetite (64.5%), vomiting (67.6%), diarrhoea');
			}
			agent.add(new Card({
				 title: `BMJ`,
				 buttonText: 'Ebola virus infection',
				 buttonUrl: 'https://bestpractice.bmj.com/topics/en-gb/1210/diagnosis-approach'
			   })
			);
		}
	}
}


function topicByNameHandler(agent) {
    const topics = agent.parameters.topics;
    const topicsPartial = agent.parameters.topicsPartial;
    console.log(`topics:- ${topics}`);
    console.log(`topicsPartial:- ${topicsPartial}`);
    if(lang == "de"){
	    if(topics) {
            agent.add('https://bestpractice.bmj.com/topics/en-gb/44');
		    agent.add(`Jeder bestimmte Abschnitt`);
		    agent.add(new Suggestion('Zusammenfassung'));
		    agent.add(new Suggestion('Behandlungsalgorithmus'));
		    agent.add(new Suggestion('Richtlinien'));
            //agent.setContext({
            agent.context.set({
                name: 'topicbyname-followup',
                lifespan: 2,
                parameters:{topics: topics}
            });
	    }
	    if(topicsPartial) {
		    agent.add(`Du kamst herein ${topicsPartial}`);
		    agent.add(new Suggestion('Akutes Asthma Exazerbat..'));
		    agent.add(new Suggestion('Asthma bei Kindern'));
		    agent.add(new Suggestion('Asthma bei Erwachsenen'));
	    }
	}else{
	    if(topics) {
		    agent.add(`Any particular section`);
		    agent.add(new Suggestion('Summary'));
		    agent.add(new Suggestion('Treatment algorithm'));
		    agent.add(new Suggestion('Guidelines'));
    		if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
    		    let conv = agent.conv();
    		    conv.ask(`Any particular section`);
    		    conv.ask(new Suggestions(['Summary','Treatment algorithm', 'Guidelines']));
    			conv.ask(new LinkOutSuggestion({
                  name: `${topics}`,
                  url: `https://bestpractice.bmj.com/topics/en-gb/44`
                }));
                agent.add(conv);
    		}else {	
                agent.add(new Card({
                    title: `BMJ`,
                    buttonText: `${topics}`,
                    buttonUrl: 'https://bestpractice.bmj.com/topics/en-gb/44'
                }));
    		}
		    
            agent.context.set({
                name: 'topicbyname-followup',
                lifespan: 2,
                parameters:{topics: topics}
            });
	    }
	    if(topicsPartial) {
		    agent.add(`You entered ${topicsPartial}`);
		    agent.add(new Suggestion('Acute asthma exacerbat...'));
		    agent.add(new Suggestion('Asthma in children'));
		    agent.add(new Suggestion('Asthma in adults'));
	    }
	}
}


function topicByNameCustomHandler(agent) {
 // const topicbynameContext = agent.getContext('topicbyname-followup');
    const topicbynameContext = agent.context.get('topicbyname-followup');     
    const topics = topicbynameContext.parameters.topics;
    const topicSection = agent.parameters.topicSection;
    console.log(`topics-- ${topics}`);
    console.log(`topicSection-- ${topicSection}`);
    if(lang == "de"){
		if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
		    let conv = agent.conv();
		    conv.ask(`gefragt ${topics} Sektion ${topicSection}!`);
			conv.ask(new LinkOutSuggestion({
              name: topicSection,
              url: 'https://bestpractice.bmj.com/topics/en-gb/44/guidelines'
            }));
            agent.add(conv);
		}else {	
		    agent.add(`gefragt ${topics} Sektion ${topicSection}!`);
        agent.add(new Card({
             title: `BMJ`,
             buttonText: 'Besuchen Sie BMJ Best Practice',
             buttonUrl: 'https://bestpractice.bmj.com/topics/en-gb/44/guidelines'
           })
         );
		}
	}else{
		if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
		    let conv = agent.conv();
		    conv.ask(`asked for ${topics} section ${topicSection}!`);
			conv.ask(new LinkOutSuggestion({
              name: topicSection,
              url: 'https://bestpractice.bmj.com/topics/en-gb/44/guidelines'
            }));
            agent.add(conv);
		}else {	
		    agent.add(`asked for ${topics} section ${topicSection}!`);
        agent.add(new Card({
             title: `BMJ`,
             buttonText: 'Visit BMJ Best Practice',
             buttonUrl: 'https://bestpractice.bmj.com/topics/en-gb/44/guidelines'
           })
         );
		}
	}           
}

  function languagesHandler(agent) {
    const language = agent.parameters.language;
    const programmingLanguage = agent.parameters.ProgrammingLanguage;
	console.log(`language: ${language}`);
	console.log(`programmingLanguage: ${programmingLanguage}`);

    if (language) {
		if(lang == "de"){
			agent.add(`Beeindruckend! Ich wusste nicht, dass du ${language} kennst. Wie lange kennen Sie ${language}?`);
		}else{
			agent.add(`Wow! I didn't know you knew ${language}. How long have you known ${language}?`);
		}
        agent.setContext({
              name: 'languages-followup',
              lifespan: 2,
              parameters:{language: language}
            });
    } else if (programmingLanguage) {
		if(lang == "de"){
			agent.add(`${programmingLanguage} ist cool`);
		}else{
			agent.add(`${programmingLanguage} is cool`);
		}
        agent.setContext({
              name: 'languages-followup',
              lifespan: 2,
              parameters:{ProgrammingLanguage: programmingLanguage}
            });
    } else {
        agent.add("What language do you know?")
    }
  }

  function languagesCustomHandler(agent) {
    console.log('languagesCustomHandler');
    const context = agent.getContext('languages-followup');
    const allContexts = agent.contexts;
    const language = context.parameters.language || context.parameters.ProgramingLanguage;
    const duration = agent.parameters.duration.amount;
    const unit = agent.parameters.duration.unit;
	const dur =  	
	request.body.queryResult.outputContexts;
    console.log(`dur: ${dur}`);
		if(lang == "de"){
			agent.add(`Ich kann nicht glauben, dass Sie ${language} für ${duration} kennen!`);
		}else{
			agent.add(`I can't believe you've know ${language} for ${duration}!`);
		}
    
  }

function getBlastOverview(agent) {
		if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
		    let conv = agent.conv();
		    conv.ask(`Blast phase of chronic myelogenous leukaemia (CML), which can be discovered incidentally on FBC or in assessment of patients with symptoms and signs such as fever, fatigue, weight loss, anaemia...`);  
			conv.ask(new LinkOutSuggestion({
              name: 'Blast crisis over...',
              url: 'https://bestpractice.bmj.com/topics/en-gb/1026'
            }));
            agent.add(conv);
		}else {	
		    agent.add(`Blast phase of chronic myelogenous leukaemia (CML), which can be discovered incidentally on FBC or in assessment of patients with symptoms and signs such as fever, fatigue, weight loss, anaemia...`);  
			agent.add(new Card({
				 title: `BMJ`,
				 buttonText: 'Blast crisis overview',
				 buttonUrl: 'https://bestpractice.bmj.com/topics/en-gb/1026'
			   })
			);
		}
}

function getMaleOverview(agent) {
		if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
		    let conv = agent.conv();
		    conv.ask(`Presence of abnormal semen parameters in the male partner of a couple unable to achieve conception after 1 year of unprotected intercourse.\n\n Male factor alone contributes to 20% of cases of...`);  
			conv.ask(new LinkOutSuggestion({
              name: 'Male factor infer...',
              url: 'https://bestpractice.bmj.com/topics/en-gb/497'
            }));
            agent.add(conv);
		}else {	
		    agent.add(`Presence of abnormal semen parameters in the male partner of a couple unable to achieve conception after 1 year of unprotected intercourse.\n\n Male factor alone contributes to 20% of cases of...`);  
			agent.add(new Card({
				 title: `BMJ`,
				 buttonText: 'Male factor infer...',
				 buttonUrl: 'https://bestpractice.bmj.com/topics/en-gb/497'
			   })
			);
		}
}


function getTesticularPrevention(agent) {
		if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
		    let conv = agent.conv();
		    conv.ask(`Secondary\n\n`);  
		    conv.ask(`No definite preventative action is recommended. However, immunisation is not recommended during the`);  
			conv.ask(new LinkOutSuggestion({
              name: 'Secondary preven...',
              url: 'https://bestpractice.bmj.com/topics/en-gb/176/prevention'
            }));
            agent.add(conv);
		}else {	
		    agent.add(`Secondary`);  
		    agent.add(`No definite preventative action is recommended. However, immunisation is not recommended during the`);  
			agent.add(new Card({
				 title: `BMJ`,
				 buttonText: 'Secondary preven...',
				 buttonUrl: 'https://bestpractice.bmj.com/topics/en-gb/176/prevention'
			   })
			);
		}
}

function getGuillianPrevention(agent) {
		if (agent.requestSource === agent.ACTIONS_ON_GOOGLE) {
		    let conv = agent.conv();
		    conv.ask(`Secondary prevention\n\n`);  
		    conv.ask(`No definite preventative action is recommended. However, immunisation is not recommended during the`);  
			conv.ask(new LinkOutSuggestion({
              name: 'Secondary prevention',
              url: 'https://bestpractice.bmj.com/topics/en-gb/176/prevention'
            }));
            agent.add(conv);
		}else {	
		    agent.add(`Secondary prevention`);  
		    agent.add(`No definite preventative action is recommended. However, immunisation is not recommended during the`);  
			agent.add(new Card({
				 title: `BMJ`,
				 buttonText: 'Secondary prevention',
				 buttonUrl: 'https://bestpractice.bmj.com/topics/en-gb/176/prevention'
			   })
			);
		}
}

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('name', nameHandler);
  intentMap.set('languages', languagesHandler);
  intentMap.set('Languages - custom', languagesCustomHandler);
  intentMap.set('topic', topicHandler);
  intentMap.set('search', searchHandler);
  intentMap.set('specialties', specialtiesHandler);
  intentMap.set('topic.by.name', topicByNameHandler);
  intentMap.set('topic.by.name - custom', topicByNameCustomHandler);
  intentMap.set('prevention', preventionHandler);
  intentMap.set('diagnosis', diagnosisHandler);
  intentMap.set('treatment', treatmentHandler);
  intentMap.set('treatment.algorithm', treatmentAlgorithmHandler);
  intentMap.set('treatment.approach', treatmentApproachHandler);
  intentMap.set('diagnosis - custom', diagnosisCustomHandler);
  intentMap.set('overview', overviewHandler);
  agent.handleRequest(intentMap);
});
			