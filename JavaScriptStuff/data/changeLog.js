/**
 * Ideas to implement:
 * Prestige obviously (nested layers similar to Leaf Blower Revolution)
 * Challenges obviously
 * 
 * Reduce save file size (import/export) by calculating highlighted indexes defaulting to all indexes highlighted
 * Encode/decode save files to save space and also prevent the easiest cheats of all time
 * Easter eggs?
 * Achivements with buffs similar to Antimatter Dimensions
 * More interactive rolls -> SFX, types of rolls, hotkeys, etc.
 * 
 * Debuff patterns. These reduce the multiplier or nullify it completely
 * Use "pies" to decrease debuffs or disable these multipliers
 * Pattern mastery? Idea similar to Scrap Clicker II
 */

export const changeLog = [
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