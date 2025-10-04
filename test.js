const { Osascript } = require("./Osascript");
const script = new Osascript();

(async () => {
  try {
    //
    // 🟥 STEP 1 — Open Reddit and apply styling
    //
    await script.executeScript([
      script.appleCommands.notifications.alertWithSound(
        "🌐 Launching Apple-JS Demo",
        "Opening Reddit for visual automation...",
        "Submarine"
      ),
      script.appleCommands.browser.openInChrome("https://www.reddit.com"),
      script.appleCommands.delay(6),

      // Inject gradient background + popup banner
      script.appleCommands.dom.run(`
        (function(){
          function waitForBody(cb){
            if(document.body) return cb();
            new MutationObserver((m,o)=>{ if(document.body){ o.disconnect(); cb(); } })
              .observe(document.documentElement,{childList:true,subtree:true});
          }
          waitForBody(()=>{
            document.body.style.background='linear-gradient(180deg,#0f0,#060)';
            document.body.style.color='#fff';

            const popup=document.createElement('div');
            popup.textContent='🤖 Automated by Apple-JS';
            Object.assign(popup.style,{
              position:'fixed',top:'20px',left:'50%',transform:'translateX(-50%)',
              background:'#00ff99',color:'#000',padding:'14px 26px',
              borderRadius:'12px',fontWeight:'bold',fontSize:'22px',
              fontFamily:'Helvetica,Arial,sans-serif',boxShadow:'0 0 25px #00ff99',
              zIndex:999999
            });
            document.body.appendChild(popup);

            document.querySelectorAll('article').forEach((a,i)=>{
              if(i<3){
                a.style.border='3px solid #00ff99';
                a.style.borderRadius='10px';
                a.style.boxShadow='0 0 20px #00ff99';
                a.style.padding='6px';
              }
            });
            console.log("✅ Reddit styling applied by Apple-JS");
          });
        })();
      `),

      script.appleCommands.delay(3),
      script.appleCommands.notifications.alertWithSound(
        "✅ Reddit Styled",
        "Reddit page styled successfully by Apple-JS!",
        "Glass"
      )
    ]);

    //
    // 🧠 STEP 2 — Use AI assistant capabilities
    //
    await script.executeScript([
      script.appleCommands.ai.introduceYourself(),
      script.appleCommands.delay(2),
      script.appleCommands.ai.tellTechJoke(),
      script.appleCommands.delay(2),
      script.appleCommands.ai.predictProductivity(),
      script.appleCommands.delay(2),
      script.appleCommands.ai.devWisdom(),
      script.appleCommands.delay(2),
      script.appleCommands.ai.giveCompliment(),
      script.appleCommands.delay(2)
    ]);

    //
    // ⚙️ STEP 3 — System + Fun namespace actions
    //
    await script.executeScript([
      script.appleCommands.systemControl.screenshotToDesktop(),
      script.appleCommands.fun.playSosumi(),
      script.appleCommands.delay(2),
      script.appleCommands.getFrontmostApp(),
      script.appleCommands.ui.typeText("Apple-JS automation demo complete ✅", 0.3)
    ]);

    //
    // 📝 STEP 4 — Open Notes and document the automation
    //
    await script.executeScript([
      script.appleCommands.application.open("Notes"),
      script.appleCommands.delay(3),
      script.appleCommands.fun.playSosumi()
    ]);

    //
    // 🎯 STEP 5 — Wrap-Up
    //
    await script.executeScript([
      script.appleCommands.ai.dailyAffirmation(),
      script.appleCommands.delay(2),
      script.appleCommands.notifications.alertWithSound(
        "🎉 Apple-JS Showcase Complete",
        "Reddit restyled, AI responded, system automated, and Notes updated.",
        "Hero"
      ),
      script.appleCommands.speak("Automation sequence complete. Apple-JS is awesome!")
    ]);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    script.close();
  }
})();
