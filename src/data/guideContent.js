export function getGuideContent(sectionId, state) {
  switch (sectionId) {
    case "introduction":
      return {
        title: "Introduction",
        paragraphs: [
          "You've just woken up from a deep, uncanny slumber, but something is wrong. You're feel uneasy in an almost familiar room. The clock ticks backwards. The tables have three legs. The lights flicker with a dull, unnatural orange...",
          "Peering out the now heptagonal window, all you find is the desolate remains of the suburbs. It's not destroyed, but... altered? You can't pinpoint the problem, but the overwhelming culmination of shapes bending backwards makes you feel uneasy.",
          "\"What on Earth happened...\"",
          "Walking outside, you slowly take in the Picasso-esque buildings around you. They twist recursively onto themselves like drunk sketches, and the sidewalk splits and distorts into intricate fractals. The crushing feeling of estrangement sinks in as you realize you're likely the only person stuck in this bizarre land.",
          "The research facility still stands though. It was the foundation of this city, and numerous world-class physicists worked there daily. Now, it sits silent.",
          "Outside, a familiar but languished bulletin remains. Once buzzing with flyers and notices, it now holds a single torn newspaper, barely clinging on.",
          "BREAKING NEWS! Controlling Reality-Altering Physics",
          "March 14, 2159. Pieman \"Roy\" the 328th's experiment was a resouding success.",
          "\"Half a century ago, researching the intricate patterns behind the universe, Pieman \'Rui\' the 324th found the fundamental structures underlying reality all trace back to a single origin: [REDACTED].\"",
          "But now, after decades of research Roy and his team successfully manipulated [REDACTED].",
          "You sigh. Of course they did. Fragments of the newspaper remain scattered across the floor. You recognize the equations written on them, but they're followed by one erraneous equation",
          "\"You bum of man, Rui,\" you smirk.",
          "The universe hasn't collapsed, but only time will tell how much longer it can hold on.",
          "Inside the facility now, you head to the control panel. Panels flicker awake, and numbers cascade across the screen. Patterns flood the numbers. Broken patterns.",
          "You hestiate, but it must be done.",
          "If reality can be altered, it can be restored.",
          "Welcome to Pattern Incremental!",
        ]
      };

    case "rolls":
      return {
        title: "Rolls",
        paragraphs: [
          "Rolls are the core mechanic in Pattern Incremental. They generate a random n-digit number and delineate the patterns found.",
          "The rolled number gives a base value, then matching patterns multiply that value.",
          "Some upgrades add flat value before or after multipliers."
        ]
      };

    case "points":
      return {
        title: "Points",
        paragraphs: [
          "Points are the main currency in Pattern Incremental. They are earned through rolls, but heavily depends on pattern RNG :)",
        ]
      };

    case "patterns":
      return {
        title: "Patterns",
        paragraphs: [
          "Patterns are special properties a roll can match, such as Even, Palindrome, or Lucky 7s.",
          "Each matched pattern adds its own multiplier. These multipliers stack multiplicatively, so they will scale very hard once you have many collected. Many of these multipliers will also scale based on the number of digits in the roll. For example, 'Full Flush' is much harder to get with more digits, so its base value increases exponentially with digit count.",
          "Each pattern will also reward you with 'patterns.' This is the secondary currency after points.",
          "Note that patterns require a certain number of digits. This is to prevent numbers like '1' proccing every pattern",
          "A list of all unlocked patterns can be seen in the patterns tab"
        ]
      };

    case "upgrades":
      return {
        title: "Upgrades",
        paragraphs: [
          "Upgrades unlock new mechanics, patterns, and scaling. There are a few types, but the main ones are: Digits, Unlock, Pattern, and Multiplier",
          "Not all upgrades will be linked. Not all upgrades will be immediately visible or purchaseable.",
          "You can click and drag on any of the upgrades trees, or click 'Reset View' on the top right to go back to the top left."
        ]
      };

    case "automation":
      return {
        title: "Automation",
        paragraphs: [
          "Automation rolls numbers automatically using its own rolls and multipliers. By default, this happens every 10 seconds, but can go down to 0.5 seconds",
          "It uses its own digit cap, and this cap is always less than or equal to the unlocked digit cap.",
          "You can control interval and display behavior in Settings. The display behavior options are to never show it, show it on every roll, and show it only if it enters the top 20 best rolls."
        ]
      };

    case "simulateRoll":
      return {
        title: "Simulating Rolls",
        paragraphs: [
          "Rolls can be simulated on the 'Patterns' tab. There are options to toggle global multipliers and automation multipliers.",
          "Automation multipliers will also apply the patterns list if toggled"
        ]
      };

    case "bestRolls":
      return {
        title: "Best Rolls",
        paragraphs: [
          "Best Rolls keeps your highest rolls by total total gain.",
          "You can inspect old rolls to see their matched patterns and breakdown.",
          "If content regarding your rolls change between versions, some old rolls may be marked outdated."
        ]
      };

    case "tiers":
      return {
        title: "Tiers",
        paragraphs: [
          "Congratulations on unlocking the Logarithmic Tier! These are named based on increasing growth rates and represent a new unlocked digit in the game. Think of them as your main progression chapters.",
        ]
      };

    case "recasting":
      return {
        title: "Recasting",
        paragraphs: [
          "Congratulations! You've accumulated enough knowledge to open a wormhole to a parallel universe with slightly tweaked parameters, but it's barely large enough to fit your body. It looks a bit unstable too, so hopefully you stay in one piece and retain your memories going through....",
          "Recasting is the first prestige system in this game. It will reset all progress prior to casting, including all upgrades, all currencies, and all patterns. In exchange, it will award you with casts and shards, both of which can be redeemed in the Casting tab.",
        ]
      };

    case "linear":
      return {
        title: "Linear Tier",
        paragraphs: [
          "You're probably feeling the perils of RNG at this moment. That's pretty normal. I'm glad to tell you that it'll only get more crazy from here :)",
          "This is the point of the game where everything starts scaling HARD. It's okay for things to take longer, and for those of you who are autoclicker clanker carried, please be patient! Make sure you bought all of the upgrades available to you.",
          "It's also at this point where you can personalize your gameplay experience a bit more. Starting from here, they'll be more active and passive routes to proceed.",
        ]
      };

    case "challenges":
      return {
        title: "Challenges",
        paragraphs: [
          "Will be added in a future version :)"
        ]
      };

    default:
      return {
        title: "Guide",
        paragraphs: [
          "Select a guide topic from the left."
        ]
      };
  }
}