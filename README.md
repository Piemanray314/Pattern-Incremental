# Pattern Incremental
Current version: 0.5

Inspired by Idle Dice, https://www.rngdle.com/, and Antimatter Dimensions (￣▽￣)

Pattern Incremental is a game all about rolling numbers for patterns. Each roll increments your point count, and it gets boosted based on how many patterns are in your number!
The more you play, the more digits and patterns you unlock. Eventually, I want to have 1000 patterns in this game >:)

---------------------------------------------------------------------------------

### Prepare for game-irrelevant yap below this

I'm not great at JavaScript, but I know the basics of HTML/CSS/JS, so this is my first larger scale project to get more familiar with it :)
I have years of experience in Java though (less in other languages), so it's not terrible to adapt. Very weird though. JS, you are _weird_.
Also first time like actually using GitHub!!

A lot of help from ChatGPT was used initially, mostly for initial UI then some later for general standards. The general process is:
1. I'll code something "functional" but not sustainable (mostly cause not knowing good syntax and good JS practices)
2. I asked ChatGPT for recommendations, asking things like is it scaleable, and is it written in a clean manner
3. It fixes my code, I learn some JavaScript, then adopt some of its recommendations

Initially, ChatGPT kept bashing my head in with ridiculous and funky code, but since version 0.3, I'm barely using it anymore. Only really for checking code if I'm unsure about a good approach.
Thank you ChatGPT for writing the foundational code and teaching me good coding structure!! Without you, I'm sure this project would be a mess!! Don't wanna rely on you to much though. It's refreshing and validating to write things yourself :) Also it would probably explode into a buggy schizo amnesic mess after the project contains more than 4 lines of code anyway

Anyway, this project is mostly for fun, so here's some fun things about JS I wanted to share while learning:

List of weird but awesome JS quirks:
- ```?.``` and ```??``` are weird but awesome lol
- Setting something in an array past its max index just extends the array?? No out of bounds exception??
- ```...``` is the most nonchalant madlad ever. Copy arrays, combine arrays, turn them into parameters, or infinite function parameters??
- Destructuring. Might be the greatest thing ever ngl (you can tell I wrote these in the order I learned them)
  - It's makes reading code impossibly harder though :)

List of weird JS quirks:
- Literally nothing about const, let, and var makes sense. 
  - What do you mean BLOCK SCOPE?? If I let ```x``` be something inside an if statement, why can I use it OUTSIDE OF IT?? But not var of course, which is function-scpoed for no reason
  - So... we're just gonna let the fact you can do ```var x = 2;``` then ```var x = 3;``` right after it slide yeah?
  - What good bagel allowed ```console.log(x);``` to throw an error, but adding ```var x = 5;``` on THE NEXT LINE makes it output "undefined" instead?? Stupid hoisted variables
  - You would think const was immutable but noooooooo

List of weird but terrible JS quirks:
- No integer types? You're telling me I have to deal with ```0.30000000000000004``` everywhere.... I loooove adding tolerance checks
- So much freedom and flexibility and syntax abuse! Java is the explicit and rigorous professor. JS is the kitbashed jargon moshpit of degenerate symbol abuse
