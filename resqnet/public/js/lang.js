/* ResQNet — multilingual UI (Sinhala / Tamil / English)
   Translates any element with a data-i18n="key" attribute.
   Language choice is remembered in the browser for the session.
   People type their messages in whatever language they choose;
   this switches the interface labels so a Sinhala- or Tamil-only
   citizen can understand and use the app. */
(function () {
  const T = {
    en: {
      "nav.safety":"Safety","nav.how":"How it works","nav.volunteer":"Volunteer",
      "nav.shelters":"Shelters","nav.saferoute":"Safe route","nav.transparency":"Transparency",
      "nav.missing":"Missing persons","nav.signin":"Sign in","nav.join":"Join",
      "hero.kick":"Community emergency network",
      "hero.title":"When minutes decide everything.",
      "hero.h1":"When minutes<br>decide <em>everything.</em>","hero.lead":"ResQNet connects the citizens who witness an emergency, the volunteers who can respond, and the organisations who coordinate — on one live network across Sri Lanka.","hero.signin":"Sign in","hero.volunteer":"Join as volunteer","nav.signin":"Sign in","nav.join":"Join","stat.hotline":"Emergency hotline — tap to call","stat.ambulance":"Ambulance: 1990 (Suwa Seriya)","stat.roles":"Connected roles","stat.rolesdesc":"Citizen · Volunteer · Organisation","stat.districts":"Districts covered","stat.districtsdesc":"See resolved incidents →",
      "hero.report":"🚨 Report an emergency","hero.signin":"Sign in","hero.volunteer":"Join as volunteer",
      "hero.noaccount":"No account needed to report — just tap and go.",
      "missing.title":"Missing persons","missing.tag":"Help reunite families",
      "missing.desc":"During a disaster, families get separated. Report someone who is missing, or check the list to help find them and reunite them with their loved ones.",
      "missing.report":"Report a missing person","missing.view":"View missing persons",
      "lang.label":"Language",
      "chat.hint":"You can type in Sinhala, Tamil or English — send your message in your own language.","chat.title":"Incident chat","chat.ph":"Type a message…",
      "how.k":"How it works","how.title":"Three people. One network.",
      "how.report":"Citizens report","how.respond":"Volunteers respond","how.coord":"Organisations coordinate",
    },
    si: {
      "nav.safety":"ආරක්ෂාව","nav.how":"ක්‍රියාත්මක වන ආකාරය","nav.volunteer":"ස්වේච්ඡා සේවක",
      "nav.shelters":"රැකවරණ මධ්‍යස්ථාන","nav.saferoute":"ආරක්ෂිත මාර්ගය","nav.transparency":"විනිවිදභාවය",
      "nav.missing":"අතුරුදහන් වූ පුද්ගලයින්","nav.signin":"පිවිසෙන්න","nav.join":"සම්බන්ධ වන්න",
      "hero.kick":"ප්‍රජා හදිසි ජාලය",
      "hero.title":"මිනිත්තු කිහිපයක් සියල්ල තීරණය කරන විට.",
      "hero.h1":"මිනිත්තු කිහිපයෙන්<br>සියල්ල <em>තීරණය වේ.</em>","hero.lead":"ResQNet හදිසි අවස්ථාවක් දකින පුරවැසියන්, ප්‍රතිචාර දැක්විය හැකි ස්වේච්ඡා සේවකයන් සහ සම්බන්ධීකරණය කරන සංවිධාන එකම සජීවී ජාලයකට සම්බන්ධ කරයි.","hero.signin":"පිවිසෙන්න","hero.volunteer":"ස්වේච්ඡා සේවකයෙකු ලෙස එක්වන්න","nav.signin":"පිවිසෙන්න","nav.join":"එක්වන්න","stat.hotline":"හදිසි ඇමතුම් අංකය — ඇමතීමට ස්පර්ශ කරන්න","stat.ambulance":"ගිලන්රථ: 1990 (සුව සැරිය)","stat.roles":"සම්බන්ධිත භූමිකා","stat.rolesdesc":"පුරවැසි · ස්වේච්ඡා සේවක · සංවිධානය","stat.districts":"ආවරණය වූ දිස්ත්‍රික්ක","stat.districtsdesc":"විසඳූ සිද්ධි බලන්න →",
      "hero.report":"🚨 හදිසි අවස්ථාවක් වාර්තා කරන්න","hero.signin":"පිවිසෙන්න","hero.volunteer":"ස්වේච්ඡා සේවකයෙකු ලෙස සම්බන්ධ වන්න",
      "hero.noaccount":"වාර්තා කිරීමට ගිණුමක් අවශ්‍ය නැත — ස්පර්ශ කර යන්න.",
      "missing.title":"අතුරුදහන් වූ පුද්ගලයින්","missing.tag":"පවුල් නැවත එක්කරන්න උදව් කරන්න",
      "missing.desc":"ව්‍යසනයකදී පවුල් වෙන් වේ. අතුරුදහන් වූ අයෙකු වාර්තා කරන්න, නැතහොත් ඔවුන් සොයා ගැනීමට ලැයිස්තුව පරීක්ෂා කරන්න.",
      "missing.report":"අතුරුදහන් වූ අයෙකු වාර්තා කරන්න","missing.view":"අතුරුදහන් වූ අය බලන්න",
      "lang.label":"භාෂාව",
      "chat.hint":"ඔබට සිංහල, දෙමළ හෝ ඉංග්‍රීසි භාෂාවෙන් ටයිප් කළ හැක — ඔබේම භාෂාවෙන් පණිවිඩය යවන්න.","chat.title":"සිද්ධි කතාබහ","chat.ph":"පණිවිඩයක් type කරන්න…",
      "how.k":"ක්‍රියාත්මක වන ආකාරය","how.title":"පුද්ගලයන් තිදෙනෙක්. එක් ජාලයක්.",
      "how.report":"පුරවැසියන් වාර්තා කරයි","how.respond":"ස්වේච්ඡා සේවකයන් ප්‍රතිචාර දක්වයි","how.coord":"සංවිධාන සම්බන්ධීකරණය කරයි",
    },
    ta: {
      "nav.safety":"பாதுகாப்பு","nav.how":"எப்படி வேலை செய்கிறது","nav.volunteer":"தன்னார்வலர்",
      "nav.shelters":"தங்குமிடங்கள்","nav.saferoute":"பாதுகாப்பான வழி","nav.transparency":"வெளிப்படைத்தன்மை",
      "nav.missing":"காணாமல் போனவர்கள்","nav.signin":"உள்நுழைய","nav.join":"இணைய",
      "hero.kick":"சமூக அவசர வலையமைப்பு",
      "hero.title":"நிமிடங்கள் அனைத்தையும் தீர்மானிக்கும் போது.",
      "hero.h1":"நிமிடங்கள்<br>அனைத்தையும் <em>தீர்மானிக்கும்.</em>","hero.lead":"ResQNet அவசரநிலையைக் காணும் குடிமக்கள், பதிலளிக்கக்கூடிய தன்னார்வலர்கள் மற்றும் ஒருங்கிணைக்கும் அமைப்புகளை ஒரே நேரடி வலையமைப்பில் இணைக்கிறது.","hero.signin":"உள்நுழைய","hero.volunteer":"தன்னார்வலராக இணையுங்கள்","nav.signin":"உள்நுழைய","nav.join":"இணைய","stat.hotline":"அவசர தொலைபேசி — அழைக்க தட்டவும்","stat.ambulance":"ஆம்புலன்ஸ்: 1990 (சுவ செரிய)","stat.roles":"இணைந்த பாத்திரங்கள்","stat.rolesdesc":"குடிமகன் · தன்னார்வலர் · அமைப்பு","stat.districts":"உள்ளடக்கிய மாவட்டங்கள்","stat.districtsdesc":"தீர்க்கப்பட்ட சம்பவங்களைப் பார்க்கவும் →",
      "hero.report":"🚨 அவசரநிலையைப் புகாரளிக்கவும்","hero.signin":"உள்நுழைய","hero.volunteer":"தன்னார்வலராக இணையுங்கள்",
      "hero.noaccount":"புகாரளிக்க கணக்கு தேவையில்லை — தட்டி அனுப்புங்கள்.",
      "missing.title":"காணாமல் போனவர்கள்","missing.tag":"குடும்பங்களை மீண்டும் இணைக்க உதவுங்கள்",
      "missing.desc":"பேரிடரின் போது குடும்பங்கள் பிரிந்து விடுகின்றன. காணாமல் போன ஒருவரைப் புகாரளிக்கவும், அல்லது அவர்களைக் கண்டறியப் பட்டியலைச் சரிபார்க்கவும்.",
      "missing.report":"காணாமல் போனவரைப் புகாரளிக்கவும்","missing.view":"காணாமல் போனவர்களைப் பார்க்கவும்",
      "lang.label":"மொழி",
      "chat.hint":"நீங்கள் சிங்களம், தமிழ் அல்லது ஆங்கிலத்தில் தட்டச்சு செய்யலாம் — உங்கள் சொந்த மொழியில் செய்தியை அனுப்புங்கள்.","chat.title":"சம்பவ அரட்டை","chat.ph":"செய்தியைத் தட்டச்சு செய்யவும்…",
      "how.k":"எப்படி வேலை செய்கிறது","how.title":"மூன்று பேர். ஒரு வலையமைப்பு.",
      "how.report":"குடிமக்கள் புகாரளிக்கின்றனர்","how.respond":"தன்னார்வலர்கள் பதிலளிக்கின்றனர்","how.coord":"அமைப்புகள் ஒருங்கிணைக்கின்றன",
    }
  };

  const LANGS = [["en","English"],["si","සිංහල"],["ta","தமிழ்"]];
  function get(){ try { return sessionStorage.getItem("resqnet_lang") || "en"; } catch(e){ return "en"; } }
  function set(l){ try { sessionStorage.setItem("resqnet_lang", l); } catch(e){} apply(l); }

  function apply(lang){
    const dict = T[lang] || T.en;
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const k = el.getAttribute("data-i18n");
      if (dict[k] != null) el.textContent = dict[k];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(el=>{
      const k = el.getAttribute("data-i18n-ph");
      if (dict[k] != null) el.setAttribute("placeholder", dict[k]);
    });
    document.querySelectorAll("[data-i18n-html]").forEach(el=>{
      const k = el.getAttribute("data-i18n-html");
      if (dict[k] != null) el.innerHTML = dict[k];
    });
    document.documentElement.setAttribute("lang", lang);
    // update the picker's active state
    document.querySelectorAll(".lang-opt").forEach(b=>{
      b.classList.toggle("on", b.dataset.l === lang);
    });
  }

  function buildPicker(){
    if (document.getElementById("langPicker")) return;
    const box = document.createElement("div");
    box.id = "langPicker";
    box.setAttribute("role","group");
    box.setAttribute("aria-label","Choose language");
    box.innerHTML =
      '<span class="lang-ico" aria-hidden="true">🌐</span>' +
      LANGS.map(([code,label]) =>
        `<button type="button" class="lang-opt" data-l="${code}">${label}</button>`
      ).join("");
    document.body.appendChild(box);
    box.querySelectorAll(".lang-opt").forEach(b=>{
      b.addEventListener("click",()=> set(b.dataset.l));
    });

    const css = document.createElement("style");
    css.textContent = `
      #langPicker{position:fixed;right:14px;bottom:14px;z-index:9999;display:flex;
        align-items:center;gap:2px;background:#12181f;border:1px solid #2b3742;
        border-radius:999px;padding:5px 8px;box-shadow:0 6px 22px rgba(0,0,0,.35);
        font-family:'Quicksand',system-ui,sans-serif;}
      #langPicker .lang-ico{font-size:15px;margin-right:2px;opacity:.85}
      #langPicker .lang-opt{border:0;background:transparent;color:#c7d2dc;cursor:pointer;
        font-size:13px;font-weight:600;padding:5px 9px;border-radius:999px;line-height:1;
        transition:background .15s,color .15s;font-family:inherit;}
      #langPicker .lang-opt:hover{background:#1d2731;color:#fff}
      #langPicker .lang-opt.on{background:#c0303a;color:#fff}
      @media(max-width:560px){#langPicker{right:10px;bottom:10px;padding:4px 6px}
        #langPicker .lang-opt{font-size:12px;padding:5px 7px}}
    `;
    document.head.appendChild(css);
  }

  document.addEventListener("DOMContentLoaded", function(){
    buildPicker();
    apply(get());
  });
})();
