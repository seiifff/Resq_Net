/* ResQNet — multilingual UI (Sinhala / Tamil / English)
   Translates any element with a data-i18n="key" attribute.
   Language choice is remembered in the browser for the session.
   People type their messages in whatever language they choose;
   this switches the interface labels so a Sinhala- or Tamil-only
   citizen can understand and use the app. */
(function () {
  const T = {
    en: {
      "nav.safety":"Safety","nav.map":"Live map","nav.how":"How it works","nav.volunteer":"Volunteer",
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
      "how.report":"Citizens report","how.respond":"Volunteers respond","how.coord":"Organisations coordinate","reg.title":"Create your account","reg.sub":"It takes less than a minute.","reg.want":"I want to","reg.citizen":"Report emergencies","reg.citizendesc":"Citizen — report incidents and request help","reg.volunteer":"Respond to alerts","reg.volunteerdesc":"Volunteer — get alerts matched to your skills","login.title":"Sign in","login.sub":"Enter your details to continue.","login.email":"Email","login.pass":"Password","rep.title":"Report an emergency","rep.type":"Emergency type","rep.location":"Your location","rep.locating":"Getting your location…","rep.retry":"Retry","rep.needs":"What do you need?","mp.title":"Missing persons register","mp.name":"Full name","mp.desc":"Description","mp.lastseen":"Last seen (place / time)","mp.district":"District","mp.contact":"Contact for information","sh.name":"Shelter name","sh.capacity":"Capacity","sh.housed":"Currently housed","sh.contact":"Contact","sh.notes":"Notes","sh.save":"Save shelter","sr.title":"Safe evacuation route","sr.nearest":"Nearest shelters","type.flood":"Flood","type.fire":"Fire","type.accident":"Accident","type.medical":"Medical","qr.badge":"Emergency report · no account needed","qr.title":"What's happening?","qr.lead":"Tap the type of emergency. Your location is captured automatically. No sign-up, no password — just report.","qr.supplies":"Do you need any supplies?","qr.send":"🚨 Send emergency report","page.missing":"Missing persons register","page.feed":"Transparency feed","page.admin":"Organisation dashboard","page.report":"Report an emergency","page.shelters":"Emergency shelters","page.saferoute":"Safe route","page.volunteer":"Volunteer dashboard","page.map":"Live incident map",
      "how.lead":"The citizen who reports, the volunteer who responds, and the organisation that coordinates — connected in real time.",
      "how.reportdesc":"An emergency is reported in seconds — GPS captured automatically, a photo attached, and the need tagged: water, medical, evacuation.",
      "how.responddesc":"Volunteers see only alerts matching their skills and district, claim an incident, and check in every fifteen minutes — silence escalates it automatically.",
      "how.coorddesc":"Every incident, photo and resource need is grouped by district on a live command dashboard, with a 🔥 risk heatmap showing high-risk zones — 25 water requests in Kandy, not 25 scattered messages.",
      "how.find":"🔎 Find",
      "how.reportidx":"📢 Report",
      "missing.viewdesc":"See everyone currently reported missing, with last-seen location and details, so you can help find them.",
      "missing.reportdesc":"Report a family member or neighbour who is missing so volunteers and the community can look out for them.",
      "safety.k":"Safety",
      "safety.title":"Know what to do before help arrives.",
      "safety.lead":"The first minutes of any emergency belong to you. These basics save lives.",
      "safety.flood":"Flood",
      "safety.fire":"Fire",
      "safety.medical":"Medical",
      "safety.flood1":"Move to higher ground immediately — never wait for water to rise",
      "safety.flood2":"Avoid walking or driving through moving water",
      "safety.flood3":"Switch off mains electricity if water enters your home",
      "safety.fire1":"Get out, stay out — never go back inside for belongings",
      "safety.fire2":"Stay low under smoke; cover your nose and mouth",
      "safety.fire3":"Feel doors before opening — heat means fire behind",
      "safety.medical1":"Call 1990 (Suwa Seriya) — free island-wide ambulance",
      "safety.medical2":"Don't move an injured person unless in immediate danger",
      "safety.medical3":"Apply firm pressure to bleeding with a clean cloth",
      "foot.contact":"Contact",
      "foot.emergency":"Emergency: 117",
      "foot.ambulance":"Ambulance: 1990",
      "foot.team":"ResQNet Project Team<br>SLIIT, Sri Lanka",
      "foot.platform":"Platform",
      "foot.becomevol":"Become a volunteer",
      "foot.join":"Join the network",
      "foot.signin":"Sign in",
      "foot.shelters":"Emergency shelters",
      "foot.missing":"Missing persons",
      "foot.saferoute":"Safe route",
      "foot.feed":"Transparency feed",
      "foot.safetytips":"Safety tips",
      "foot.client":"Our client",
      "foot.clientdesc":"Built for the Sri Lanka Red Cross Society as our client stakeholder, who provided feedback through our sprint reviews.",
      "foot.credit":"ResQNet — Community Emergency Response Network · SLIIT · CIS047-3",
    },
    si: {
      "nav.safety":"ආරක්ෂාව","nav.map":"සජීවී සිතියම","nav.how":"ක්‍රියාත්මක වන ආකාරය","nav.volunteer":"ස්වේච්ඡා සේවක",
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
      "how.report":"පුරවැසියන් වාර්තා කරයි","how.respond":"ස්වේච්ඡා සේවකයන් ප්‍රතිචාර දක්වයි","how.coord":"සංවිධාන සම්බන්ධීකරණය කරයි","reg.title":"ඔබේ ගිණුම සාදන්න","reg.sub":"මිනිත්තුවකට අඩු කාලයක් ගතවේ.","reg.want":"මට අවශ්‍යයි","reg.citizen":"හදිසි අවස්ථා වාර්තා කරන්න","reg.citizendesc":"පුරවැසි — සිද්ධි වාර්තා කර උදව් ඉල්ලන්න","reg.volunteer":"ඇඟවීම්වලට ප්‍රතිචාර දක්වන්න","reg.volunteerdesc":"ස්වේච්ඡා සේවක — ඔබේ කුසලතාවලට ගැළපෙන ඇඟවීම් ලබා ගන්න","login.title":"පිවිසෙන්න","login.sub":"ඉදිරියට යාමට ඔබේ විස්තර ඇතුළත් කරන්න.","login.email":"විද්‍යුත් තැපෑල","login.pass":"මුරපදය","rep.title":"හදිසි අවස්ථාවක් වාර්තා කරන්න","rep.type":"හදිසි වර්ගය","rep.location":"ඔබේ ස්ථානය","rep.locating":"ඔබේ ස්ථානය ලබා ගනිමින්…","rep.retry":"නැවත උත්සාහ කරන්න","rep.needs":"ඔබට අවශ්‍ය කුමක්ද?","mp.title":"අතුරුදහන් වූ පුද්ගලයින්ගේ ලේඛනය","mp.name":"සම්පූර්ණ නම","mp.desc":"විස්තරය","mp.lastseen":"අවසන් වරට දුටු (ස්ථානය / වේලාව)","mp.district":"දිස්ත්‍රික්කය","mp.contact":"තොරතුරු සඳහා සම්බන්ධ වන්න","sh.name":"රැකවරණ මධ්‍යස්ථානයේ නම","sh.capacity":"ධාරිතාව","sh.housed":"දැනට රැඳී සිටින","sh.contact":"සම්බන්ධතා","sh.notes":"සටහන්","sh.save":"රැකවරණ මධ්‍යස්ථානය සුරකින්න","sr.title":"ආරක්ෂිත ඉවත් වීමේ මාර්ගය","sr.nearest":"ආසන්නතම රැකවරණ මධ්‍යස්ථාන","type.flood":"ගංවතුර","type.fire":"ගින්න","type.accident":"අනතුර","type.medical":"වෛද්‍ය","qr.badge":"හදිසි වාර්තාව · ගිණුමක් අවශ්‍ය නැත","qr.title":"කුමක් සිදුවෙමින් තිබේද?","qr.lead":"හදිසි අවස්ථාවේ වර්ගය තට්ටු කරන්න. ඔබේ ස්ථානය ස්වයංක්‍රීයව ලබා ගැනේ. ලියාපදිංචියක් හෝ මුරපදයක් අවශ්‍ය නැත — වාර්තා කරන්න.","qr.supplies":"ඔබට කිසියම් සැපයුමක් අවශ්‍යද?","qr.send":"🚨 හදිසි වාර්තාව යවන්න","page.missing":"අතුරුදහන් වූ පුද්ගලයින්ගේ ලේඛනය","page.feed":"විනිවිදභාවය","page.admin":"සංවිධාන උපකරණ පුවරුව","page.report":"හදිසි අවස්ථාවක් වාර්තා කරන්න","page.shelters":"හදිසි රැකවරණ මධ්‍යස්ථාන","page.saferoute":"ආරක්ෂිත මාර්ගය","page.volunteer":"ස්වේච්ඡා සේවක උපකරණ පුවරුව","page.map":"සජීවී සිද්ධි සිතියම",
      "how.lead":"වාර්තා කරන පුරවැසියා, ප්‍රතිචාර දක්වන ස්වේච්ඡා සේවකයා සහ සම්බන්ධීකරණය කරන සංවිධානය — සජීවීව සම්බන්ධ වී.",
      "how.reportdesc":"හදිසි අවස්ථාවක් තත්පර කිහිපයකින් වාර්තා වේ — GPS ස්වයංක්‍රීයව ලබා ගැනේ, ඡායාරූපයක් අමුණා, අවශ්‍යතාව සලකුණු කරයි: ජලය, වෛද්‍ය, ඉවත් කිරීම.",
      "how.responddesc":"ස්වේච්ඡා සේවකයන් තම කුසලතා සහ දිස්ත්‍රික්කයට ගැළපෙන ඇඟවීම් පමණක් දකී, සිද්ධියක් භාර ගනී, සෑම විනාඩි පහළොවකට වරක් වාර්තා කරයි — නිශ්ශබ්දතාව ස්වයංක්‍රීයව උත්සන්න කරයි.",
      "how.coorddesc":"සෑම සිද්ධියක්ම, ඡායාරූපයක් සහ සම්පත් අවශ්‍යතාවක්ම දිස්ත්‍රික්කය අනුව සජීවී විධාන පුවරුවක සමූහගත කර ඇත, 🔥 අවදානම් තාප සිතියමක් සමඟ — මහනුවර ජල ඉල්ලීම් 25ක්, විසිරුණු පණිවිඩ 25ක් නොව.",
      "how.find":"🔎 සොයන්න",
      "how.reportidx":"📢 වාර්තා කරන්න",
      "missing.viewdesc":"දැනට අතුරුදහන් වූ ලෙස වාර්තා වී ඇති සියලුම දෙනා, අවසන් වරට දුටු ස්ථානය සහ විස්තර සමඟ බලන්න.",
      "missing.reportdesc":"අතුරුදහන් වූ පවුලේ සාමාජිකයෙකු හෝ අසල්වැසියෙකු වාර්තා කරන්න, ස්වේච්ඡා සේවකයන්ට සහ ප්‍රජාවට ඔවුන් සොයා බැලිය හැක.",
      "safety.k":"ආරක්ෂාව",
      "safety.title":"උදව් පැමිණීමට පෙර කළ යුත්ත දැනගන්න.",
      "safety.lead":"ඕනෑම හදිසි අවස්ථාවක පළමු මිනිත්තු ඔබ සතුයි. මෙම මූලික කරුණු ජීවිත බේරයි.",
      "safety.flood":"ගංවතුර",
      "safety.fire":"ගින්න",
      "safety.medical":"වෛද්‍ය",
      "safety.flood1":"වහාම උස් බිමකට යන්න — ජලය නැගීමට කිසිදා බලා නොසිටින්න",
      "safety.flood2":"ගලා යන ජලය හරහා ඇවිදීම හෝ රිය පැදවීම වළක්වන්න",
      "safety.flood3":"ඔබේ නිවසට ජලය ඇතුළු වුවහොත් ප්‍රධාන විදුලිය අක්‍රිය කරන්න",
      "safety.fire1":"පිටතට යන්න, පිටත රැඳී සිටින්න — බඩු සඳහා කිසිදා ආපසු ඇතුළට නොයන්න",
      "safety.fire2":"දුම යට පහත් වී සිටින්න; ඔබේ නාසය සහ මුඛය ආවරණය කරන්න",
      "safety.fire3":"විවෘත කිරීමට පෙර දොරවල් අත ගා බලන්න — රත් වීම යනු පිටුපස ගින්නයි",
      "safety.medical1":"1990 අමතන්න (සුව සැරිය) — නොමිලේ දිවයින පුරා ගිලන්රථ",
      "safety.medical2":"ක්ෂණික අනතුරක් නොමැති නම් තුවාල වූ අයෙකු චලනය නොකරන්න",
      "safety.medical3":"පිරිසිදු රෙද්දකින් ලේ ගැලීම මත ස්ථිර පීඩනයක් යොදන්න",
      "foot.contact":"සම්බන්ධතා",
      "foot.emergency":"හදිසි: 117",
      "foot.ambulance":"ගිලන්රථ: 1990",
      "foot.team":"ResQNet ව්‍යාපෘති කණ්ඩායම<br>SLIIT, ශ්‍රී ලංකාව",
      "foot.platform":"වේදිකාව",
      "foot.becomevol":"ස්වේච්ඡා සේවකයෙකු වන්න",
      "foot.join":"ජාලයට එක්වන්න",
      "foot.signin":"පිවිසෙන්න",
      "foot.shelters":"හදිසි රැකවරණ මධ්‍යස්ථාන",
      "foot.missing":"අතුරුදහන් වූ පුද්ගලයින්",
      "foot.saferoute":"ආරක්ෂිත මාර්ගය",
      "foot.feed":"විනිවිදභාව සංග්‍රහය",
      "foot.safetytips":"ආරක්ෂණ උපදෙස්",
      "foot.client":"අපගේ සේවාදායකයා",
      "foot.clientdesc":"ශ්‍රී ලංකා රතු කුරුස සංගමය සඳහා අපගේ සේවාදායක පාර්ශවකරු ලෙස ගොඩනගා ඇත, ඔවුන් අපගේ sprint සමාලෝචන හරහා ප්‍රතිපෝෂණ ලබා දුන්නා.",
      "foot.credit":"ResQNet — ප්‍රජා හදිසි ප්‍රතිචාර ජාලය · SLIIT · CIS047-3",
    },
    ta: {
      "nav.safety":"பாதுகாப்பு","nav.map":"நேரடி வரைபடம்","nav.how":"எப்படி வேலை செய்கிறது","nav.volunteer":"தன்னார்வலர்",
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
      "how.report":"குடிமக்கள் புகாரளிக்கின்றனர்","how.respond":"தன்னார்வலர்கள் பதிலளிக்கின்றனர்","how.coord":"அமைப்புகள் ஒருங்கிணைக்கின்றன","reg.title":"உங்கள் கணக்கை உருவாக்கவும்","reg.sub":"ஒரு நிமிடத்திற்கும் குறைவாகவே ஆகும்.","reg.want":"நான் விரும்புகிறேன்","reg.citizen":"அவசரநிலைகளைப் புகாரளிக்க","reg.citizendesc":"குடிமகன் — சம்பவங்களைப் புகாரளித்து உதவி கோரவும்","reg.volunteer":"எச்சரிக்கைகளுக்குப் பதிலளிக்க","reg.volunteerdesc":"தன்னார்வலர் — உங்கள் திறன்களுக்கு ஏற்ற எச்சரிக்கைகளைப் பெறவும்","login.title":"உள்நுழையவும்","login.sub":"தொடர உங்கள் விவரங்களை உள்ளிடவும்.","login.email":"மின்னஞ்சல்","login.pass":"கடவுச்சொல்","rep.title":"அவசரநிலையைப் புகாரளிக்கவும்","rep.type":"அவசர வகை","rep.location":"உங்கள் இருப்பிடம்","rep.locating":"உங்கள் இருப்பிடத்தைப் பெறுகிறது…","rep.retry":"மீண்டும் முயற்சிக்கவும்","rep.needs":"உங்களுக்கு என்ன தேவை?","mp.title":"காணாமல் போனோர் பதிவேடு","mp.name":"முழுப் பெயர்","mp.desc":"விளக்கம்","mp.lastseen":"கடைசியாகக் கண்ட இடம் / நேரம்","mp.district":"மாவட்டம்","mp.contact":"தகவலுக்குத் தொடர்பு","sh.name":"தங்குமிடத்தின் பெயர்","sh.capacity":"கொள்ளளவு","sh.housed":"தற்போது தங்கியுள்ளோர்","sh.contact":"தொடர்பு","sh.notes":"குறிப்புகள்","sh.save":"தங்குமிடத்தைச் சேமிக்கவும்","sr.title":"பாதுகாப்பான வெளியேற்ற வழி","sr.nearest":"அருகிலுள்ள தங்குமிடங்கள்","type.flood":"வெள்ளம்","type.fire":"தீ","type.accident":"விபத்து","type.medical":"மருத்துவம்","qr.badge":"அவசர அறிக்கை · கணக்கு தேவையில்லை","qr.title":"என்ன நடக்கிறது?","qr.lead":"அவசரநிலை வகையைத் தட்டவும். உங்கள் இருப்பிடம் தானாகவே பதிவாகும். பதிவு அல்லது கடவுச்சொல் தேவையில்லை — அறிக்கையிடவும்.","qr.supplies":"உங்களுக்கு ஏதேனும் பொருட்கள் தேவையா?","qr.send":"🚨 அவசர அறிக்கையை அனுப்பவும்","page.missing":"காணாமல் போனோர் பதிவேடு","page.feed":"வெளிப்படைத்தன்மை","page.admin":"அமைப்பு டாஷ்போர்டு","page.report":"அவசரநிலையைப் புகாரளிக்கவும்","page.shelters":"அவசர தங்குமிடங்கள்","page.saferoute":"பாதுகாப்பான வழி","page.volunteer":"தன்னார்வலர் டாஷ்போர்டு","page.map":"நேரடி சம்பவ வரைபடம்",
      "how.lead":"புகாரளிக்கும் குடிமகன், பதிலளிக்கும் தன்னார்வலர், ஒருங்கிணைக்கும் அமைப்பு — நேரடியாக இணைக்கப்பட்டு.",
      "how.reportdesc":"அவசரநிலை சில நொடிகளில் புகாரளிக்கப்படுகிறது — GPS தானாகவே பதிவாகும், புகைப்படம் இணைக்கப்படும், தேவை குறிக்கப்படும்: நீர், மருத்துவம், வெளியேற்றம்.",
      "how.responddesc":"தன்னார்வலர்கள் தங்கள் திறன்கள் மற்றும் மாவட்டத்திற்கு ஏற்ற எச்சரிக்கைகளை மட்டுமே பார்க்கிறார்கள், ஒரு சம்பவத்தை ஏற்கிறார்கள், ஒவ்வொரு பதினைந்து நிமிடங்களுக்கும் பதிவு செய்கிறார்கள் — மௌனம் தானாகவே அதை அதிகரிக்கிறது.",
      "how.coorddesc":"ஒவ்வொரு சம்பவம், புகைப்படம் மற்றும் வள தேவையும் மாவட்டத்தின்படி நேரடி கட்டளை டாஷ்போர்டில் தொகுக்கப்படுகிறது, 🔥 அபாய வெப்ப வரைபடத்துடன் — கண்டியில் 25 நீர் கோரிக்கைகள், சிதறிய 25 செய்திகள் அல்ல.",
      "how.find":"🔎 கண்டறி",
      "how.reportidx":"📢 புகாரளி",
      "missing.viewdesc":"தற்போது காணாமல் போனதாகப் புகாரளிக்கப்பட்ட அனைவரையும், கடைசியாகக் கண்ட இடம் மற்றும் விவரங்களுடன் பார்க்கவும்.",
      "missing.reportdesc":"காணாமல் போன குடும்ப உறுப்பினர் அல்லது அயலவரைப் புகாரளியுங்கள், தன்னார்வலர்களும் சமூகமும் அவர்களைக் கவனிக்க முடியும்.",
      "safety.k":"பாதுகாப்பு",
      "safety.title":"உதவி வருவதற்கு முன் என்ன செய்வது என்று அறியுங்கள்.",
      "safety.lead":"எந்த அவசரநிலையின் முதல் நிமிடங்களும் உங்களுடையவை. இந்த அடிப்படைகள் உயிர்களைக் காப்பாற்றும்.",
      "safety.flood":"வெள்ளம்",
      "safety.fire":"தீ",
      "safety.medical":"மருத்துவம்",
      "safety.flood1":"உடனடியாக உயரமான இடத்திற்குச் செல்லுங்கள் — நீர் உயர காத்திருக்க வேண்டாம்",
      "safety.flood2":"ஓடும் நீரில் நடப்பதையோ வாகனம் ஓட்டுவதையோ தவிர்க்கவும்",
      "safety.flood3":"உங்கள் வீட்டில் நீர் நுழைந்தால் மின்சாரத்தை அணைக்கவும்",
      "safety.fire1":"வெளியே வாருங்கள், வெளியே இருங்கள் — பொருட்களுக்காக மீண்டும் உள்ளே செல்ல வேண்டாம்",
      "safety.fire2":"புகைக்கு கீழே தாழ்ந்து இருங்கள்; மூக்கையும் வாயையும் மூடுங்கள்",
      "safety.fire3":"திறப்பதற்கு முன் கதவுகளைத் தொட்டுப் பாருங்கள் — வெப்பம் என்றால் பின்னால் தீ",
      "safety.medical1":"1990 அழைக்கவும் (சுவ செரிய) — இலவச தீவு முழுவதும் ஆம்புலன்ஸ்",
      "safety.medical2":"உடனடி ஆபத்து இல்லாவிட்டால் காயமடைந்தவரை நகர்த்த வேண்டாம்",
      "safety.medical3":"சுத்தமான துணியால் இரத்தப்போக்கில் உறுதியான அழுத்தம் கொடுக்கவும்",
      "foot.contact":"தொடர்பு",
      "foot.emergency":"அவசரம்: 117",
      "foot.ambulance":"ஆம்புலன்ஸ்: 1990",
      "foot.team":"ResQNet திட்டக் குழு<br>SLIIT, இலங்கை",
      "foot.platform":"தளம்",
      "foot.becomevol":"தன்னார்வலராகுங்கள்",
      "foot.join":"வலையமைப்பில் இணையுங்கள்",
      "foot.signin":"உள்நுழைய",
      "foot.shelters":"அவசர தங்குமிடங்கள்",
      "foot.missing":"காணாமல் போனவர்கள்",
      "foot.saferoute":"பாதுகாப்பான வழி",
      "foot.feed":"வெளிப்படைத்தன்மை ஊட்டம்",
      "foot.safetytips":"பாதுகாப்பு குறிப்புகள்",
      "foot.client":"எங்கள் வாடிக்கையாளர்",
      "foot.clientdesc":"இலங்கை செஞ்சிலுவைச் சங்கத்திற்காக எங்கள் வாடிக்கையாளர் பங்குதாரராக உருவாக்கப்பட்டது, அவர்கள் எங்கள் sprint மதிப்பாய்வுகள் மூலம் கருத்துகளை வழங்கினர்.",
      "foot.credit":"ResQNet — சமூக அவசர பதில் வலையமைப்பு · SLIIT · CIS047-3",
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
