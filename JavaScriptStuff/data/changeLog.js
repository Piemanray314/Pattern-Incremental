/**
 * Ideas to implement:
 * Challenges obviously
 * Offline Progress
 * 
 * Potentially encoding save files for space (and security I guess but like the code is public)
 * Easter eggs?
 * Achivements with buffs similar to Antimatter Dimensions
 * More interactive rolls -> SFX, types of rolls, hotkeys, etc.
 * 
 * Pick-your-path upgrades (consistent/RNG points. Fast/slow runs. Cast/Shards. etc.)
 * 
 * Leaderboard...?
 * 
 * Pattern mastery? Idea similar to Scrap Clicker II
 */

export const changeLog = [
  {
    version: "0.7",
    title: "Linear Update",
    entries: [
      "Added a lot of the Linear Tier (a little bit left to go)",
      "Added more patterns (101 total)",
      "Added more casting upgrades and multiplier dies",
      "Added zooming functionality on upgrade trees. Mousewheel on web, but buttons are also available.",
      "Fixed certain patterns being too lenient + their indices",
      "Refreshing the page not properly saving fixed",
      "Some balancing changes. Thank you to all playtesters, especially glixh_hunt3r!",
    ]
  },
  {
    version: "0.61",
    title: "Small QoL Update",
    entries: [
      "Save files are now much smaller (though not encrypted yet cause bugtesting would be a pain peko",
      "Save files can now be downloaded/uploaded",
      "Added many fail safes in case saves become corrupted or no longer backwards compatible somehow. A backup can be found in local storage under key \"pattern_incremental_save_backup_before_load\"",
      "Upgrades with multiple levels now have a buy max option",
      "Buy button replaced with cost, and (current) effects are now shown for relevant upgrades",
      "Slight upgrade changes, new TAS upgrades",
      "Number settings persist through cast",
      "Time is now formatted",
    ]
  },
  {
    version: "0.6",
    title: "Casting Update Part 1",
    entries: [
      "Added Casting: the first prestige mechanic!",
      "Two new currencies: Casts and Shards",
      "New Casting tab, and new casting upgrades",
      "New 'Guide' tab",
      "Slight rebalancing on previous upgrades",
      "Reworked statistics tab to no longer show recent roll statistics, include casts, and include a few more overall statistics",
      "Slightly reworked Automation upgrades",
    ]
  },
  {
    version: "0.5",
    title: "Logarithmic Tier update",
    entries: [
      "Added most of the planned second tier content (logarithmic tier)",
      "Added more patterns (69 total)",
      "Manual/Auto toggle in preview now changes pattern list multipliers",
      "Most patterns have a hard-coded minimum required digits to prevent automation abuse",
      "Many patterns now scale with digit count",
      "Selected 'mini-tab' in tabs now persist",
      "Loooooots of bug fixing again"
    ]
  },
  {
    version: "0.41",
    title: "MORE FIXES RAHHHHH",
    entries: [
      "Added \"requiredDigits\" stat to patterns to prevent exploiting 1-digit automators recieving ridiculous multipliers",
      "Upgrades now have colors based on type",
      "Automatically minimize auto-roll interval upon upgrading",
      "Removed pausing auto-rolls for 5 seconds after manual rolls",
      "Upgrades no longer show cost at max level",
      "Added header tab on top of the patterns list",
      "Change log now shows most recent changes first",
      "Bug fixed the palindrome pattern not working",
      "Bug fixed auto-rolls being able to roll 0"
    ]
  },
  {
    version: "0.4",
    title: "MORE CONTENT RAHHHHH",
    entries: [
      "Added more patterns (28 total)",
      "Added more upgrades",
      "Added new upgrade tabs",
      "Selected tab and position in upgrade trees now persist",
      "Mobile/Automatic roll toggle in simulated roll",
      "Fixed current roll multipliers not calculating properly in patterns list",
      "Lots of rebalancing",
      "Backend bug-fixing and changes to make incorporating future content easier"
    ]
  },
  {
    version: "0.31",
    title: "Yeah so the roll wasn't working",
    entries: [
      "Yeah so uhhhh I checked for like every bug without rolling from the main button, so that's fixed now!"
    ]
  },
  {
    version: "0.3",
    title: "Import/Export, Backend fixes, and Yaddi Yaddi",
    entries: [
      "Reworked patterns to be more scaleable",
      "Added comments on many files explaining code. I couldn't be bothered after like 15 of them. Mostly for docuemntation",
      "Added a change log + version tracking",
      "Added Import/Export options",
      "Added a new number system. It's very silly but won't be noticeable until the game scales much harder in the future",
      "Fixed the Automation section of Settings being unresponsive by adding a Confirmation button",
      "Fixed bugs regarding patterns not being evaluated properly",
      "Fixed bugs regarding currentMultipliers not udpating properly",
      "Just fixed lots of bugs in general, I forgot them all",
      "Removed the imaginary nekos that a certain weeb prophesied"
    ]
  },
  {
    version: "0.2",
    title: "Automation and Best Rolls",
    entries: [
      "Added automation tab",
      "Added best rolls tab with roll breakdowns",
      "Added displayed-roll logic for auto rolls",
      "Added more patterns (24 total)",
      "Failed to fix bugs allowing user 'the woke left' to reach unreasonably high numbers",
      "Thank you playtesters 'the woke left', 'thefakekole,' 'Glixh Hunt3r,' and a cruddy 5-digit"
    ]
  },
  {
    version: "0.1",
    title: "Initial Prototype",
    entries: [
      "This is the very base game. Rolling, several patterns, some upgrades, and basically nothing else",
      "Added rolling and pattern matching",
      "Added upgrade tree",
      "Added very basic save system"
    ]
  }
];