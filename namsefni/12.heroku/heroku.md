---
title: Heroku
---

## Heroku

### Vefforritun

### Ólafur Sverrir Kjartansson, [osk@hi.is](mailto:osk@hi.is)

---

## Heroku PaaS

* Heroku er _platform as a service_ (PaaS)
  * Keyrir ofan á AWS (Amazon Web Services)
* Getum keyrt forritin okkar í „skýinu“
* Þurfum ekki að hugsa um að reka vélar
  * Keyrum forritið okkar sem „app“

***

## Heroku vefur

* Við skráum okkur á [heroku.com](https://www.heroku.com/)
  * Heroku er með [frítt plan](https://www.heroku.com/free)
  * Nýtið ykkur [developer pack gegnum GitHub Student](https://www.heroku.com/github-students)
* Eftir skráningu getum við búið til nýtt app
* Getum tengt forritin okkar með GitHub eða Heroku CLI

***

## Heroku CLI

* [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) leyfir okkur að framkvæma aðgerðir á móti Heroku
  * Bæði þær sem eru í boði á vef [og aðrar](https://devcenter.heroku.com/categories/command-line)
  * Skráum okkur inn með `heroku login` eftir uppsetningu
* Munum nota í bland við vefviðmót

---

## [The Twelve-Factor App](https://12factor.net/)

* Samansafn af 12 atriðum sem hjálpa okkur að skrifa forrit sem „auðvelt“ er að reka
* Brúar að einhverju leiti bilið á milli _development_ og _operations_, _devops_
* Byggt á reynslu þeirra sem bjuggu til Heroku

***

## [I. Codebase](https://12factor.net/codebase)

* „One codebase tracked in revision control, many deploys“
* Geymum alltaf appið okkar í source control
* Eitt app, mörg _deploy_

***

* Með Heroku CLI getum við bætt við _remote_ til að _pusha_ úr _repository_
  * `heroku git:remote -a app-nafn`
  * `git push heroku master`
  * `git push branch-nafn:master -f` ef við viljum ýta branch á Heroku

***

![Mynd sem sýnir mörg deploy úr einu codebase](img/codebase-deploys.png "https://12factor.net/codebase")

***

## [II. Dependencies](https://12factor.net/dependencies)

* „Explicitly declare and isolate dependencies“
* Við gerum ekki ráð fyrir óbeinum dependencies
  * Ef eitthvað vantar mun Heroku ekki geta keyrt appið okkar
* Skilgreinum nákvæmlega hvað við þurfum (`package.json`!)

***

## [III. Config](https://12factor.net/config)

* „Store config in the environment“
* Stillingar eru það sem er ólíkt á milli deploys
  * Gagnagrunnur, aðgangsupplýsingar o.fl.
* Eða mismunandi á milli forritara
* Vistum **ekki** í kóða, geymum í _umhverfi_

***

## process.env

* Við getum sent upplýsingar inní forritið okkar með því að skrifa breytur á undan keyrslu
  * `PORT=9999 node app.js`
* Lesum síðan úr `process.env` sem er hlutur sem geymir allar umhverfisbreytur
  * `const port = env.process.PORT;`

***

* Getum breytt porti eftir þörfum
  * Eitt port á meðan við þróum, annað á raun-keyrsluþjóni
* Á við um margt annað
  * Einn gagnagrunnur hjá mér í þróun, annar hjá þér
  * o.s.fr.

***

## .env

* Ekki handhægt að senda hverja og eina breytu handvirkt inn í keyrslu
* Notum `.env` skrár til að geyma og [`dotenv`](https://github.com/motdotla/dotenv) til að lesa upp
* Viljum **alls ekki** geyma `.env` skrár í source control svo við bætum við í `.gitignore`
  * Getur geymt leyndarmál, auðkenningar o.þ.h.

***

.env

```bash
HOST=localhost
PORT=7777
```

app.js

<!-- eslint-disable no-unused-vars, import/no-unresolved -->

```javascript
import dotenv from 'dotenv';

dotenv.config();

const {
  HOST: hostname = '127.0.0.1',
  PORT: port = 3000,
} = process.env;
```

***

## NODE_ENV

* Sérstakt umhverfisgildi sem segir til um í hvaða umhverfi við erum
  * `development` ef við erum í þróun, `production` ef í keyrslu
* Notað af sumum forritum (t.d. express) til að gefa auka upplýsingar í þróun og auka hraða í keyrslu

***

* Ættum ekki að setja sjálf en setja í umhverfinu okkar
* [The drastic effects of omitting NODE_ENV in your Express.js applications](https://www.dynatrace.com/news/blog/the-drastic-effects-of-omitting-node_env-in-your-express-js-applications/)

***

## [IV. Backing services](https://12factor.net/backing-services)

* „Treat backing services as attached resources“
* _Backing service_ er þjónusta sem við þurfum fyrir forrit og nálgumst yfir net
  * T.d. gagnagrunnar, póstþjónar o.fl.
* App tengist öllu gegnum URL (t.d. tengistreng)
* Gerir ekki greinarmun á þjónustu settri upp á eigin tölvu og frá þriðja aðila

***

![Mynd sem sýnir hvernig tengja má margar mismunandi þjónustur](img/attached-resources.png "https://12factor.net/backing-services")

***

* Heroku hefur upp á að bjóða mikið af þjónustum eða [_add-ons_](https://elements.heroku.com/addons)
  * T.d. [Heroku Postgres](https://elements.heroku.com/addons/heroku-postgresql)
* Bætum við gegnum vef eða CLI og fáum URL sem umhverfisbreytu í appinu okkar

***

* `heroku addons:create heroku-postgresql:hobby-dev`
* Fáum `DATABASE_URL` í env
* Gagnagrunnur sem við getum strax byrjað að nota!

***

Komumst inn á grunninn með því að nota `psql` eða bæta við tengingu í pgAdmin

```bash
# Skrifum út tengistreng
heroku config:get DATABASE_URL -a app-nafn

# Tengjumst með psgl
heroku psql -a app-nafn
```

***

## [V. Build, release, run](https://12factor.net/build-release-run)

* „Strictly separate build and run stages“
* Kóða er breytt í _deploy_ í þremur skrefum
  * **Build**, kóði ásamt dependencies og öðru er sett saman í _build_
  * **Release**, _build_ ásamt config er útgáfa með auðkenni
  * **Run**, útgáfa er keyrð upp

***

* Þar sem hvert build hefur auðkenni getum við auðveldlega bakkað með release
* Gerir það auðveldara að gefa út
  * Ef eitthvað klikkar erum við einu klikki frá því að bakka í fyrri útgáfu

***

![Mynd sem sýnir flæði frá kóða í build, úr build með config í release](img/release.png "https://12factor.net/build-release-run")

***

## [VI. Processes](https://12factor.net/processes)

* „Execute the app as one or more stateless processes“
* Við keyrum app með einum eða fleirum stöðulausum processum
* Hver keyrsla er stöðulaus og deilir engu með öðrum keyrslum

***

* Getum því ekki treyst á að nota minni eða skráarkerfi fyrir geymslu á gögnum
* Ef við vistum eitthvað á skráarkerfi Heroku mun það ekki vera til staðar lengi
* Þurfum að nota aðrar þjónustur (backing service) til a geyma þessi gögn
  * Notendaupplýsingar, upplýsingar fyrir app, upplýsingar fyrir session o.fl.

***

* Til að Heroku viti hvernig eigi að keyra forrit þurfum við að skilgreina [`Procfile`](https://devcenter.heroku.com/articles/procfile)
  * `web: node app.js`
  * Segir Heroku að keyra upp vefapp (mun nota HTTP virkni) með `node app.js`
* Fyrir Node.js mun Heroku keyra sjálfgefið upp `web` app með `npm start` ef `Procfile` er ekki til

***

## [VII. Port binding](https://12factor.net/port-binding)

* „Export services via port binding“
* App _bindur_ sig við port í keyrsluumhverfi
* Hlustar á beiðnir sem koma inn á því porti

***

## Heroku og port

Verðum að keyra `app.listen` aðeins með porti, ekki `hostname`:

<!-- eslint-disable no-undef -->

```javascript
const host = '127.0.0.1';
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`http://${host}:${port}/`);
});
```

***

## [VIII. Concurrency](https://12factor.net/concurrency)

* „Scale out via the process model“
* Við getum hannað forritin okkar þannig að þau nýti mismunandi _process type_
  * t.d. `web` fyrir veftraffík, `worker` fyrir gagnavinnslu

***

* Heroku notar [_dynos_](https://www.heroku.com/dynos) sem eru containers sem keyra forritin okkar
* Getum stýrt hve margir dynos keyra undir hverju process type
* Skölum upp ef við þurfum að meðhöndla mikið, annars skölum við niður
  * `heroku ps:scale web=2 worker=4`

***

![Graf sem sýnir hvernig skala má forrit á tveim ásum, á x-ás eftir gerð vinnu, á y-ás með fjölda dyno sem sjá um þá vinnu](img/process-types.png "Mynd: https://12factor.net/concurrency")

***

## [IX. Disposability](https://12factor.net/disposability)

* „Maximize robustness with fast startup and graceful shutdown“
* Öpp eru keyrð upp og slökkt á þeim án hiks
* Þurfum að passa upp á að gögn séu ekki geymd í minni, komum frá okkur sem fyrst
  * t.d. með því að nota _message queue_
* App ætti að vera fljótt að kveikja á sér

***

## [X. Dev/prod parity](https://12factor.net/dev-prod-parity)

* „Keep development, staging, and production as similar as possible“
* Viljum minnka bilið á milli...
  * Þess hve hratt við gefum út
  * Þeirra sem skrifa forrit og gefa þau út (_devops_)
  * Tóla sem notuð eru, þróunar og keyrslu umhverfi ættu að vera eins

***

* Ef það er erfitt að gefa út gerum við það sjaldnar og það verður erfiðara
  * Óþægilegur vítahringur
* Að geta gefið út daglega eða oft á dag er stór kostur
* Ekkert ætti að koma okkur á óvart milli umhverfa

***

## [XI. Logs](https://12factor.net/logs)

* „Treat logs as event streams“
* App ætti ekki að hugsa um að geyma logga, aðeins að skrifa út hvað gerist
* Í þróun fylgist forritari með í console
* Í keyrslu er þeim ýtt í sérstök kerfi sem leyfa okkur að skoða og fylgjast með

***

## Logging

* Skrifum út í console upplýsingar um keyrslu
  * `console.info` (stdout) fyrir hluti sem vert er að vita, t.d. innskráningu
  * ``console.info(`Login: ${username}`);``
  * `console.error`  (stderr) fyrir villur, t.d. í villuhandler

***

* Að skrifa góða logga er vandasamt
* Verðum að passa að skrifa ekki viðkvæm gögn í logga, t.d. lykilorð eða kreditkortanúmer
  * Getur leitt til mikilla vandræða

***

* Getum séð nýlega logga í vef eða gegnum CLI
  * `heroku logs` sýnir logga
  * `heroku logs --tail` sýnir nýjar færslur þegar þær koma
* Þurfum að bæta við resource sem geymir logga fyrir okkur
  * t.d. [papertrail](https://elements.heroku.com/addons/papertrail)

***

## [XII. Admin processes](https://12factor.net/admin-processes)

* „Run admin/management tasks as one-off processes“
* Oft þurfum við að framkvæma aðgerðir sem eru ekki tengdar daglegri keyrslu
  * t.d. útbúa gagnagrunn, tilfærsla á gögnum í gagnagrunni, hreinsa gögn

***

* Keyrum sem _one-off_ aðgerðir sem nýta eigin process óháð annari keyrslu
  * Heroku leyfir okkur að [keyra með `heroku run <script>`](https://devcenter.heroku.com/articles/one-off-dynos)
* Getum nýtt líkt og `npm script`
