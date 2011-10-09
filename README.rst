About
=====
*Super beta, draft, ugly, etc.*
iPad app to help me run OSRIC_ pen & paper role-playing games.


Requirements & Install
======================
It's a web app. Point iPad at web server serving up this code.

Expects `Sencha Touch`__ css/js files to be added::

    c/sencha-touch.css
    j/sencha-touch.js

__ http://www.sencha.com/products/touch/


TODO
====

 - BUG: death/capture, xp award fails until killtab displayed at least once.
 - Spell stats and info screen after casting.
 - Ability to browse spellbook.
 - Uniques; only one instance of.
 - Uniques; Local storage unique mobs' state.
 - Unittests http://google-opensource.blogspot.com/2011/09/introducing-google-js-test.html
 - More Refactor butt ugly code/structure into something not so embarrasing.
 - Offline store of console log, clear log.
 - Upload stored data to server/email.
 - Add loot to monsters.
 - "Encounter" & "rooms". Group of monsters and loot together.
 - Temp tohit/damage/save mods, (like from bless)
 - Distinguish betwen AC and nodex/noshield AC.
 - Record Loot.
 - Load Monster manual, Spell Book from url.
 - Treasure generation.
 - Random encounters.
 - Finish and integrate my Tablesmith_ table processing js lib.
 - Improve performance of action screen.
 - Time tracking.
 - Make "rules system" modular so can make |LL|_ and |SW|_ modules.
 - Permanent server to host app, data, etc.


PIE IN THE SKY
--------------

 - Integrated, interactive dungeon / wilderness maps.
 - Worry about users other than me.
 - Rewrite without Sencha Touch.

Done
====
 - BUG Spells casted are per type not per instance.



.. _osric: http://en.wikipedia.org/wiki/OSRIC
.. _tablesmith: http://mythosa.net/wiki/pmwiki.php?n=Main.TableSmith
.. |SW| replace:: Swords & Wizardry
.. _sw: http://www.swordsandwizardry.com/
.. |LL| replace:: Labyrinth Lord
.. _ll: http://www.goblinoidgames.com/labyrinthlord.html
