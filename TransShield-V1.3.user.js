// ==UserScript==
// @name         TransShield
// @namespace    https://github.com/KirbySoftware/TransShield
// @version      1.3
// @description  Form Automation/Spammer/Flooder for a certain fascist health website
// @author       KirbySoftware
// @match        https://www.hhs.gov/protect-kids/index.html
// @match        https://www.hhs.gov/protect-kids/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';    // Core variables
    let loopCount = GM_getValue('loopCount', 0); // Track submissions
    let waitingForCaptcha = false;
    let lastFormData = {}; // For data variation    // CAPTCHA API variables
    let captchaApiKey = GM_getValue('captchaApiKey', '');
    let captchaProvider = GM_getValue('captchaProvider', '2captcha'); // Default to 2captcha
    let captchaAutoMode = GM_getValue('captchaAutoMode', false);

    // Automation control variables
    let isAutomating = false;
    let automationInterval = null;

    // Config constants
    const userLogin = "KirbySoftware";
    const targetUrl = "https://www.hhs.gov/protect-kids/index.html";// US area codes
    const validAreaCodes = [
        // Common area codes
        202, 213, 305, 404, 512, 602, 703, 808, 917, 218, 303, 415, 505, 616, 718, 801, 920, 336, 479, 210,
        619, 781, 864, 907, 971, 458, 775, 410, 785, 660, 586, 850, 309, 912, 681, 559, 434, 854,
        214, 281, 312, 313, 314, 321, 347, 407, 412, 443, 480, 503, 504, 510, 513, 561, 562, 609, 610, 612, 614, 626, 630, 650, 678,
        702, 704, 713, 714, 720, 760, 773, 813, 816, 817, 832, 847, 901, 909, 916, 925, 949, 954, 972,
        // Additional codes
        205, 206, 209, 212, 215, 216, 217, 219, 225, 228, 229, 234, 239, 240, 248, 251, 252, 253, 254, 256,
        260, 262, 267, 269, 270, 276, 279, 301, 302, 304, 307, 308, 310, 315, 316, 317, 318, 319, 320, 323,
        325, 330, 331, 332, 334, 337, 339, 341, 346, 351, 352, 360, 361, 380, 385, 386, 401, 402, 405,
        406, 408, 409, 413, 414, 419, 423, 424, 425, 430, 432, 435, 440, 442, 445, 447, 448, 463, 469,
        470, 475, 478, 484, 501, 502, 507, 508, 509, 515, 516, 517, 518, 520, 530, 534, 539, 540, 541, 551,
        557, 559, 563, 564, 567, 570, 571, 573, 574, 575, 580, 585, 601, 603, 605, 606, 607, 608, 615, 620,
        623, 628, 629, 631, 636, 641, 646, 651, 657, 662, 667, 669, 682, 701, 706, 707, 708,
        712, 715, 716, 717, 719, 724, 725, 727, 731, 732, 734, 737, 740, 743, 747, 754, 757, 762, 763, 765,
        769, 770, 772, 774, 775, 779, 781, 785, 786, 802, 803, 804, 805, 806, 810, 812, 814, 815, 828, 830,
        831, 835, 843, 845, 848, 854, 856, 857, 858, 859, 860, 862, 863, 865, 870, 872, 878, 903, 904, 906,
        908, 910, 913, 914, 915, 919, 928, 929, 931, 934, 936, 937, 938, 940, 941, 947, 951, 952, 956, 959,
        970, 973, 979, 980, 984, 985, 986, 989
    ];

    // Name data
    const firstNames = [
        'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew',
        'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna',
        'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin',
        'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia', 'Kathleen', 'Amy', 'Shirley', 'Angela', 'Helen', 'Anna', 'Brenda', 'Pamela', 'Nicole', 'Samantha', 'Katherine',
        'Frank', 'Raymond', 'Gregory', 'Patrick', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam', 'Henry', 'Nathan', 'Douglas', 'Zachary', 'Peter', 'Kyle', 'Walter', 'Ethan', 'Jeremy', 'Harold',
        'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather', 'Diane', 'Julie', 'Joyce', 'Victoria', 'Olivia', 'Ruth', 'Virginia', 'Lauren', 'Kelly', 'Christina', 'Joan',
        // 50 additional first names
        'Sophia', 'Emma', 'Ava', 'Mia', 'Isabella', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Abigail',
        'Noah', 'Liam', 'Mason', 'Lucas', 'Oliver', 'Alexander', 'Elijah', 'Logan', 'Caleb', 'Carter',
        'Grace', 'Sofia', 'Lily', 'Chloe', 'Penelope', 'Layla', 'Riley', 'Zoey', 'Nora', 'Scarlett',
        'Jackson', 'Aiden', 'Owen', 'Sebastian', 'Gabriel', 'Isaiah', 'Julian', 'Evan', 'Miles', 'Cameron',
        'Hannah', 'Leah', 'Zoe', 'Audrey', 'Eleanor', 'Savannah', 'Skylar', 'Maya', 'Claire', 'Stella'
    ];    const lastNames = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Martin',
        'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson',
        'Hill', 'Campbell', 'Mitchell', 'Roberts', 'Carter', 'Phillips', 'EvANS', 'Turner', 'Torres', 'Parker', 'Collins', 'Edwards', 'Stewart', 'Flores', 'Morris', 'Nguyen', 'Murphy', 'Rivera', 'Cook',
        'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Gomez', 'Kelly', 'Howard', 'Ward', 'Cox', 'Diaz', 'Richardson', 'Wood', 'Watson', 'Brooks', 'Bennett', 'Gray', 'James', 'Reyes',
        'Cruz', 'Hughes', 'Price', 'Myers', 'Long', 'Foster', 'Sanders', 'Ross', 'Morales', 'Powell', 'Sullivan', 'Russell', 'Ortiz', 'Jenkins', 'Gutierrez', 'Perry', 'Butler', 'Barnes', 'Fisher', 'Henderson',
        // 50 additional last names
        'Alexander', 'Griffin', 'West', 'Jordan', 'Owens', 'Reynolds', 'Ford', 'Hamilton', 'Graham', 'Kim',
        'Patel', 'Singh', 'Shah', 'Khan', 'Chen', 'Wu', 'Huang', 'Zhang', 'Wang', 'Li',
        'Rossi', 'Ferrari', 'Russo', 'Romano', 'Esposito', 'Ricci', 'De Luca', 'Colombo', 'Marino', 'Costa',
        'Castillo', 'Jimenez', 'Romero', 'Alvarez', 'Moreno', 'Ruiz', 'Serrano', 'Molina', 'Rojas', 'Ramos',
        'Grant', 'Spencer', 'Ferguson', 'Wells', 'Tucker', 'Hunter', 'Mcdonald', 'Murray', 'Warren', 'Marshall'
    ];    const middleNames = [ // Expanded list of 150 middle names
        // Original (49 unique)
        'Lee', 'James', 'Michael', 'Alan', 'David', 'Wayne', 'Robert', 'Joseph', 'Allen', 'Scott', 'Ray', 'Paul', 'Edward', 'Brian', 'John', 'William', 'Richard', 'Thomas', 'Mark',
        'Anne', 'Marie', 'Elizabeth', 'Nicole', 'Ann', 'Renee', 'Michelle', 'Louise', 'Jean', 'Rose', 'Grace', 'Jane', 'Diane', 'Kay', 'Sue', 'May', 'Jo', 'Rae', 'Hope',
        'Christopher', 'Daniel', 'Matthew', 'Andrew', 'Ryan', 'Steven', 'Kevin', 'Jeffrey', 'George', 'Charles', 'Lynn', // Added Lynn back once
        // New (51)
        'Alexander', 'Anthony', 'Arthur', 'Benjamin', 'Carl', 'Dale', 'Dean', 'Dennis', 'Douglas', 'Earl', 'Eric', 'Eugene', 'Francis', 'Frank', 'Frederick', 'Gary', 'Glenn', 'Gordon',
        'Gregory', 'Harold', 'Henry', 'Howard', 'Jack', 'Jay', 'Jerry', 'Keith', 'Kenneth', 'Larry', 'Lawrence', 'Lewis', 'Lloyd', 'Louis', 'Martin', 'Neil', 'Nicholas', 'Norman',
        'Patrick', 'Peter', 'Philip', 'Ralph', 'Raymond', 'Roger', 'Ronald', 'Roy', 'Russell', 'Samuel', 'Stephen', 'Terry', 'Timothy', 'Walter', 'Victor',
        // 50 additional middle names
        'Adrian', 'Albert', 'Blake', 'Bradley', 'Brent', 'Brett', 'Bruce', 'Caleb', 'Cameron', 'Christian',
        'Claire', 'Cynthia', 'Dawn', 'Deborah', 'Eleanor', 'Emily', 'Emma', 'Faith', 'Frances', 'Gabrielle',
        'Graham', 'Grant', 'Helen', 'Ian', 'Isaac', 'Jacob', 'Jade', 'Jasmine', 'Julia', 'Kate',
        'Leanne', 'Lily', 'Lindsay', 'Margaret', 'Mason', 'Megan', 'Nathaniel', 'Olivia', 'Owen', 'Rachel',
        'Rebecca', 'Regina', 'Sophia', 'Theodore', 'Theresa', 'Valerie', 'Victoria', 'Vincent', 'Wesley', 'Xavier'
    ];

    const nameSuffixes = ['Jr.', 'Sr.', 'II', 'III', 'IV', 'PhD', 'MD']; // Added common suffixes

    // --- Job Title Lists ---
    const healthcareJobTitles = [
        // Original titles
        'Nurse Practitioner', 'Registered Nurse', 'Medical Assistant', 'Physician Assistant', 'Office Manager', 'Billing Specialist', 'Medical Coder', 'Receptionist', 'Administrator', 'Lab Technician', 'Pharmacist', 'Physical Therapist', 'Occupational Therapist', 'Dietitian', 'Social Worker', 'Case Manager', 'Health Educator', 'Clinical Research Coordinator', 'Paramedic', 'EMT',
        // Additional healthcare titles
        'Chief Medical Officer', 'Director of Nursing', 'Healthcare Consultant', 'Medical Director', 'Quality Improvement Specialist', 'Clinical Director', 'Patient Advocate', 'Respiratory Therapist', 'Radiology Technician', 'Phlebotomist',
        'Mental Health Counselor', 'Speech Pathologist', 'Surgical Technologist', 'Hospice Coordinator', 'Infection Preventionist', 'Electronic Medical Records Specialist', 'Healthcare IT Specialist', 'Patient Services Representative', 'Medical Practice Manager', 'Telehealth Coordinator',
        'Clinical Nurse Specialist', 'Nurse Manager', 'Utilization Review Nurse', 'Healthcare Data Analyst', 'Rehabilitation Director', 'Nursing Informatics Specialist', 'Triage Nurse', 'Population Health Manager', 'Clinical Research Associate', 'Healthcare Risk Manager'
    ];
    const businessJobTitles = [
        // Original titles
        'Software Engineer', 'Project Manager', 'Business Analyst', 'Account Manager', 'Sales Representative', 'Marketing Manager', 'HR Specialist', 'Operations Manager', 'Financial Analyst', 'Data Scientist', 'Product Manager', 'UX Designer', 'Content Strategist', 'Recruiter', 'Executive Assistant', 'Accountant', 'Consultant', 'Web Developer', 'Network Administrator', 'Customer Success Manager',
        // Additional business titles
        'Chief Executive Officer', 'Chief Financial Officer', 'Chief Information Officer', 'Chief Technology Officer', 'Chief Operating Officer', 'VP of Sales', 'VP of Marketing', 'Brand Strategist', 'Social Media Manager', 'Digital Marketing Specialist',
        'Supply Chain Manager', 'Procurement Specialist', 'DevOps Engineer', 'Full Stack Developer', 'Quality Assurance Analyst', 'Business Development Manager', 'Strategic Planning Director', 'Logistics Coordinator', 'Public Relations Manager', 'Corporate Communications Director',
        'Cybersecurity Analyst', 'Compliance Officer', 'Investment Banker', 'Portfolio Manager', 'Risk Assessment Officer', 'Sustainability Coordinator', 'Innovation Director', 'User Experience Researcher', 'Systems Architect', 'Machine Learning Engineer'
    ];    // Provider relationship options
    const providerRelationships = [
        'Patient','Friend', 'Colleague', 'Observer', 'Advocate', 'None', 'Whistleblower', 'Other', 'Representative'
    ];

        // Email domains by category
    const healthcareEmailDomains = [
        'pfizer.com', 'moderna.com', 'cvshealth.com', 'unitedhealthgroup.com', 'mayo.edu',
        'clevelandclinic.org', 'kaiserpermanente.org', 'aetna.com', 'anthem.com', 'humana.com', 'bcbs.com', 'uhc.com',
        'optum.com', 'bannerhealth.com', 'medstar.net', 'partners.org', 'massgeneralbrigham.org', 'mountsinai.org',
        'mdanderson.org', 'hopkinsmedicine.org', 'stanfordhealthcare.org', 'intermountainhealthcare.org', 'providence.org',
        'sutterhealth.org', 'nyulangone.org', 'northwell.edu', 'uclahealth.org', 'cedars-sinai.org', 'hcahealthcare.com', 'ascension.org', 'trinity-health.org', 'commonspirit.org'
    ];    const personalEmailDomains = [
      // Major providers
      'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com',
      // ISPs
      'comcast.net', 'verizon.net', 'att.net', 'cox.net', 'spectrum.net', 'xfinity.com', 'charter.net', 'frontier.com',
      // Microsoft
      'msn.com', 'live.com', 'hotmail.co.uk', 'hotmail.fr', 'outlook.fr', 'outlook.co.uk', 'hotmail.es', 'outlook.es',
      // Others
      'me.com', 'ymail.com', 'sbcglobal.net', 'mac.com', 'inbox.com', 'mail.com', 'hey.com', 'hushmail.com',      // Privacy-focused (removed ones that might not pass verification)
      'protonmail.com', 'zoho.com', 'fastmail.com', 'tutanota.com', 'proton.me', 'pm.me',
      // Additional email providers (removed ones that might not pass verification)
      'gmx.com', 'gmx.net', 'mailbox.org', 'rocketmail.com', 'duck.com',
      // Country-specific domains
      'rediffmail.com', 'qq.com', 'naver.com', 'web.de', 't-online.de', 'libero.it', '163.com', 'mail.ru', 'free.fr',
      // Legacy domains
      'earthlink.net', 'juno.com', 'netzero.net', 'mindspring.com', 'aim.com', 'bellsouth.net'
    ];

    const employerEmailDomains = [
        'ibm.com', 'intel.com', 'microsoft.com', 'apple.com', 'amazon.com', 'google.com', 'facebook.com', 'meta.com',
        'twitter.com', 'netflix.com', 'tesla.com', 'cisco.com', 'nvidia.com', 'adobe.com', 'oracle.com', 'salesforce.com',
        'dell.com', 'hp.com', 'qualcomm.com', 'ge.com', 'boeing.com', 'lockheedmartin.com', 'raytheon.com',
        'accenture.com', 'deloitte.com', 'pwc.com', 'ey.com', 'kpmg.com', 'mckinsey.com', 'bcg.com', 'bain.com',
        'ford.com', 'gm.com', 'toyota.com', 'honda.com',
        'jpmorganchase.com', 'bankofamerica.com', 'wellsfargo.com', 'citigroup.com', 'goldmansachs.com',
        'homedepot.com', 'lowes.com', 'target.com', 'walmart.com',
        'fedex.com', 'ups.com', 'dhl.com',
        'whitehouse.gov'
    ];
    // Utility functions
    function getRandomElement(array) {
        if (!array || array.length === 0) return '';
        return array[Math.floor(Math.random() * array.length)];
    }    // Creates complete user identity with personal email
    function generateIdentity() {
        const firstName = getRandomElement(firstNames);
        const lastName = getRandomElement(lastNames);

        // Add optional middle name (20% chance)
        let middleName = '';
        if (Math.random() < 0.20) {
            middleName = getRandomElement(middleNames);
        }

        // Add optional suffix (3% chance)
        let suffix = '';
        if (Math.random() < 0.03) {
            suffix = getRandomElement(nameSuffixes);
        }        // Generate email based on name (more realistic and creative patterns)
        let emailName;
        const emailPattern = Math.floor(Math.random() * 24); // Expanded patterns with 24 options (added 4 new ones)

        // Common words/phrases to potentially add to emails
        const commonWords = ['best', 'cool', 'super', 'awesome', 'pro', 'real', 'true', 'top', 'smart', 'cyber', 'tech', 'digital', 'creative', 'master', 'guru', 'expert', 'elite'];
        const hobbies = ['gamer', 'coder', 'runner', 'writer', 'artist', 'photo', 'music', 'film', 'travel', 'fitness', 'chef', 'baker', 'fan', 'hero', 'star', 'ninja', 'geek'];
        const phrases = ['isthebest', 'rocks', 'isawesome', 'forever', 'fanatic', 'lover', 'enthusiast', 'master', '4life', '247', 'addict', 'premium'];
        const wordplays = ['inator', 'ology', 'aholic', 'tastic', 'licious', 'matic', 'izer', 'meister', 'smith', 'genius'];
        const randomNames = ['shadow', 'whisper', 'storm', 'pixel', 'byte', 'quantum', 'cosmic', 'magic', 'fire', 'frost', 'thunder', 'stealth', 'echo', 'nebula', 'zero', 'phoenix',];

        // Generate random combinations for more creative emails
        const getRandomWord = () => getRandomElement(commonWords);
        const getRandomHobby = () => getRandomElement(hobbies);
        const getRandomPhrase = () => getRandomElement(phrases);
        const getRandomWordplay = () => getRandomElement(wordplays);
        const getRandomName = () => getRandomElement(randomNames);

        // Number replacement patterns
        const leetSpeak = (text) => {
            const replacements = {'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7'};
            return Array.from(text).map(char => replacements[char] || char).join('');
        };

        // Function to replace some characters with numbers randomly
        const replaceWithNumbers = (name) => {
            // Only replace some characters for realism (25% chance for each eligible letter)
            return Array.from(name).map(char => {
                if (['a', 'e', 'i', 'o', 's', 't'].includes(char) && Math.random() < 0.25) {
                    const numMap = {'a': '4', 'e': '3', 'i': '1', 'o': '0', 's': '5', 't': '7'};
                    return numMap[char];
                }
                return char;
            }).join('');
        };

        switch (emailPattern) {
            // Classic patterns (higher probability - cases 0-4)
            case 0: emailName = firstName.toLowerCase() + '.' + lastName.toLowerCase(); break;
            case 1: emailName = firstName.charAt(0).toLowerCase() + lastName.toLowerCase(); break;
            case 2: emailName = lastName.toLowerCase() + '.' + firstName.toLowerCase(); break;
            case 3: emailName = firstName.toLowerCase() + lastName.charAt(0).toLowerCase(); break;
            case 4: const year = Math.floor(Math.random() * 50) + 1950; emailName = firstName.toLowerCase() + year; break;

            // More creative patterns (expanded collection)
            case 5: emailName = firstName.toLowerCase() + getRandomWord() + getRandomHobby(); break;
            case 6: emailName = getRandomWord() + firstName.toLowerCase() + lastName.charAt(0).toLowerCase(); break;
            case 7: emailName = firstName.toLowerCase() + Math.floor(Math.random() * 999) + getRandomWord(); break;            case 8: emailName = firstName.toLowerCase() + '.' + lastName.toLowerCase() + '.' + getRandomHobby(); break; // Changed underscores to dots to avoid multiple underscores
            case 9: emailName = getRandomHobby() + '.' + firstName.toLowerCase() + Math.floor(Math.random() * 99); break;
            case 10: emailName = firstName.charAt(0).toLowerCase() + middleName.charAt(0).toLowerCase() + lastName.toLowerCase() + getRandomWord(); break;
            case 11: emailName = 'the' + firstName.toLowerCase() + getRandomHobby() + Math.floor(Math.random() * 99); break;

            // New patterns with reversed names, underscores and number substitutions
            case 12: emailName = lastName.toLowerCase() + firstName.toLowerCase() + Math.floor(Math.random() * 10); break; // Removed underscore at beginning/end
            case 13: emailName = replaceWithNumbers(firstName.toLowerCase() + lastName.toLowerCase()); break; // Number substitutions
            case 14: emailName = firstName.toLowerCase() + getRandomPhrase(); break; // "tuckeristhebest" style
            case 15: emailName = firstName.toLowerCase() + lastName.charAt(0).toLowerCase() + getRandomHobby() + Math.floor(Math.random() * 100); break; // Removed misplaced underscore
            case 16: emailName = leetSpeak(firstName.toLowerCase()) + '.' + lastName.toLowerCase(); break; // j4ne.doe            case 17: emailName = firstName.toLowerCase() + lastName.toLowerCase() + getRandomHobby(); break; // janedoewriter
            case 18: emailName = firstName.charAt(0).toLowerCase() + lastName.charAt(0).toLowerCase() + getRandomWord() + Math.floor(Math.random() * 999); break; // Removed multiple underscores
            case 19: emailName = firstName.toLowerCase() + getRandomHobby() + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10); break; // Removed underscore to avoid potential email validation issues

            // The 4 new creative patterns
            case 20: emailName = firstName.toLowerCase() + getRandomWordplay(); break; // Word play based on name: "janeinator", "janeology"
            case 21: // Properly formatted multiple dots in different segments: "wow.oka.y@gmail.com"
                const segments = ['ok', 'wow', 'cool', 'yes', 'no', 'maybe', 'hey', 'hi', 'bye', 'go', 'try'];
                emailName = getRandomElement(segments) + '.' + firstName.substring(0, Math.min(3, firstName.length)).toLowerCase() +
                            '.' + lastName.substring(0, Math.min(3, lastName.length)).toLowerCase();
                break;
            case 22: emailName = getRandomName() + getRandomName() + Math.floor(Math.random() * 1000); break; // Random unrelated: "shadowstorm472"
            case 23: emailName = firstName.charAt(0).toLowerCase() + lastName.toLowerCase() +
                     (Math.random() > 0.5 ? 'says' : 'goes') + getRandomHobby(); break; // "jdoesaysmusic", "jdoegoesphoto"

            // Default fallback
            default: emailName = firstName.toLowerCase() + lastName.toLowerCase(); break;
        }

        // Sometimes add numbers at the end for common email patterns - but keep it simple
        // Only add numbers to basic patterns to avoid overly complex emails
        if (Math.random() > 0.6 && emailPattern <= 4) { // Only for standard patterns
            const currentYear = new Date().getFullYear();
            // Either use a birth year (more common) or a small number
            if (Math.random() > 0.3) {
                // Birth year (between 1960-2000)
                const birthYear = Math.floor(Math.random() * 41) + 1960;
                emailName += birthYear;
            } else {
                // Small number (1-99) - avoid excessively long random numbers
                emailName += Math.floor(Math.random() * 99) + 1;
            }
        }        // Use weighted selection to favor the most reliable email domains
        let domain;
        const reliabilityRoll = Math.random();

        // Top common email providers everyone recognizes
        const topDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'icloud.com'];        // Privacy-focused and more specialized domains that might be used by tech-savvy users (removed ones that may not pass verification)
        const specialDomains = [
            'protonmail.com', 'proton.me', 'tutanota.com', 'pm.me', 'duck.com', 'fastmail.com',
            'zoho.com', 'hushmail.com'
        ];

        if (reliabilityRoll < 0.60) {
            // 60% chance to use one of the top popular domains (gmail, yahoo, outlook, etc.)
            domain = getRandomElement(topDomains);
        } else if (reliabilityRoll < 0.85) {
            // 25% chance to use moderately common domains (ISPs and others)
            const midDomains = personalEmailDomains.slice(6, 24);
            domain = getRandomElement(midDomains);
        } else {
            // 15% chance to use any domain in the list (including less common ones)
            domain = getRandomElement(personalEmailDomains);
        }
          // Match email domain to pattern style
        if (emailPattern >= 20) {
            // For the newest 4 patterns (20-23), use more distinctive and diverse domains
            if (Math.random() > 0.5) {
                // Higher chance for privacy focused or specialized email providers
                domain = getRandomElement(specialDomains);
            } else if (emailPattern === 22 && Math.random() > 0.7) {
                // For random name pattern, sometimes use gaming-related domains
                const gamingDomains = ['protonmail.com', 'gmail.com', 'pm.me', 'outlook.com', 'duck.com'];
                domain = getRandomElement(gamingDomains);
            }
        } else if (emailPattern > 11) {
            // For creative patterns (12-19), use more distinctive domains frequently
            if (Math.random() > 0.6) {
                // Higher chance for privacy focused or specialized email providers
                domain = getRandomElement(specialDomains);
            }
        } else if (emailPattern > 4 && Math.random() > 0.7) {
            // For moderately creative patterns (5-11), occasionally use specialized domains
            domain = getRandomElement(specialDomains);
        }
          let sanitizedEmailName = emailName.replace(/[^a-z0-9.\-_]/g, ''); // First sanitize by removing invalid characters

        // Additional validation for underscore placement (can't begin or end with underscore)
        sanitizedEmailName = sanitizedEmailName
            .replace(/^_+/, '') // Remove any leading underscores
            .replace(/_+$/, '') // Remove any trailing underscores
            .replace(/__+/g, '_'); // Replace multiple consecutive underscores with a single one

        // If after sanitization we have an empty string, use a simple fallback
        if (!sanitizedEmailName) {
            sanitizedEmailName = firstName.toLowerCase() + Math.floor(Math.random() * 100);
        }

        const email = sanitizedEmailName + '@' + domain;

        // Generate phone with a valid area code
        const area = getRandomElement(validAreaCodes);
        const prefix = Math.floor(Math.random() * 800) + 200; // Avoid prefixes starting with 0 or 1
        const lineNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const phone = `(${area})-${prefix}-${lineNum}`;

        // Return the complete identity
        return {
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            suffix: suffix, // *** Include suffix (might be empty) ***
            email: email,
            phone: phone
        };
    }    // Generate business information with employer domain
    function generateBusinessInfo() {
        const businessTypes = [
            // Company types
            'Solutions', 'Systems', 'Consultants', 'Services', 'Associates', 'Partners', 'Group', 'Inc', 'LLC', 'Corp', 'Enterprises', 'Technologies', 'Ventures', 'Holdings', 'Logistics', 'Management', 'Advisors', 'Industries',
            // Additional types
            'Network', 'Agency', 'Consortium', 'Alliance', 'International', 'Global', 'Innovations', 'Strategies', 'Co', 'Laboratory', 'Institute', 'Foundation',
            'Research', 'Analytics', 'Capital', 'Investments', 'Trust', 'Association', 'Federation', 'Union', 'Collective', 'Exchange', 'Team', 'Division',
            'Brands', 'Guild', 'Works', 'Solutions', 'Center', 'Studio', 'Hub', 'Accelerator', 'Factory', 'Platform', 'Initiative', 'Labs', 'Nexus',
            'Dynamics', 'Horizon', 'Paradigm', 'Portfolio', 'Pulse', 'Sphere', 'Vanguard', 'Futures', 'SaaS', 'Cloud', 'Digital', 'Virtual'
        ];
        const businessAdjectives = [
            // Original adjectives
            'Advanced', 'Premier', 'Elite', 'National', 'Global', 'Strategic', 'Innovative', 'Dynamic', 'Pacific', 'Atlantic', 'Allied', 'United', 'Modern', 'Alpha', 'Omega', 'American', 'Eastern', 'Western',
            'Quantum', 'Apex', 'Summit', 'Pinnacle', 'Keystone', 'Cornerstone', 'Integral', 'Synergy', 'NextGen', 'Future', 'Secure', 'Reliable', 'Integrated',
            // Additional business adjectives
            'Agile', 'Adaptive', 'Authentic', 'Balanced', 'Beacon', 'Benchmark', 'Brilliant', 'Capital', 'Catalyst', 'Central', 'Champion', 'Clarity', 'Classic',
            'Core', 'Creative', 'Digital', 'Direct', 'Distinct', 'Diverse', 'Edge', 'Efficient', 'Elevate', 'Empower', 'Essential', 'Excel', 'Executive',
            'Expert', 'Focused', 'Forward', 'Frontier', 'Genesis', 'Genuine', 'Grand', 'Horizon', 'Imperial', 'Inclusive', 'Infinite', 'Ingenious', 'Insight',
            'Inspired', 'Landmark', 'Leading', 'Legacy', 'Lighthouse', 'Meridian', 'Metro', 'Northern', 'Optimum', 'Parallel', 'Paramount', 'Platinum', 'Precision',
            'Prime', 'Principle', 'Progressive', 'Prominent', 'Prosperity', 'Rapid', 'Regional', 'Resilient', 'Resolution', 'Resonant', 'Sovereign', 'Southern',
            'Specialized', 'Spectrum', 'Swift', 'Tactical', 'Transformative', 'Trusted', 'Ultimate', 'Universal', 'Urban', 'Valor', 'Venture', 'Veritas', 'Visionary'
        ];
        const businessNouns = [
            // Original nouns
            'Health', 'Tech', 'Data', 'Medical', 'Info', 'Business', 'Financial', 'Management', 'Insurance', 'Network', 'Care', 'Consulting', 'Marketing', 'Communications', 'Logistics', 'Resources', 'Security',
            'Analytics', 'Insights', 'Automation', 'Digital', 'Cloud', 'Infrastructure', 'Development', 'Strategy', 'Growth', 'Capital', 'Compliance', 'Risk',
            // Additional business nouns
            'Access', 'Advantage', 'Advisory', 'Advocate', 'Alliance', 'Architecture', 'Asset', 'Bridge', 'Cascade', 'Catalyst', 'Circuit', 'Commerce', 'Connect',
            'Cortex', 'Courier', 'Craft', 'Crest', 'Dynamic', 'Ecosystem', 'Edge', 'Element', 'Elevate', 'Empower', 'Engine', 'Enterprise', 'Equity', 'Exchange',
            'Fluid', 'Focus', 'Forge', 'Framework', 'Frontier', 'Function', 'Gateway', 'Genesis', 'Genome', 'Harbor', 'Horizon', 'Hub', 'Impact', 'Impulse', 'Incubator',
            'Index', 'Insight', 'Intelligence', 'Interface', 'Journey', 'Junction', 'Kinetics', 'Knowledge', 'Landmark', 'Legacy', 'Link', 'Matrix', 'Meridian',
            'Method', 'Milestone', 'Momentum', 'Motion', 'Nexus', 'Nuance', 'Orbit', 'Paradigm', 'Pathway', 'Pattern', 'Pinnacle', 'Platform', 'Portal', 'Prism',
            'Protocol', 'Pulse', 'Quest', 'Realm', 'Resolution', 'Resonance', 'Spectrum', 'Sphere', 'Standard', 'Stream', 'Structure', 'Synergy', 'Thesis',
            'Threshold', 'Tier', 'Touchpoint', 'Trajectory', 'Transform', 'Vantage', 'Vector', 'Venture', 'Vision', 'Wave', 'Zenith'
        ];
        const businessSurnames = [
            // Original surnames
            'Johnson', 'Martinez', 'Smith', 'Chen', 'Wang', 'Singh', 'Kim', 'Shah', 'Brown', 'Miller', 'Wilson', 'Taylor', 'Davis', 'Harris', 'Thompson', 'Anderson', 'Lee', 'Clark', 'Allen', 'Wright', 'Scott', 'Green',
            // Additional business surnames
            'Adams', 'Baker', 'Bennett', 'Brooks', 'Campbell', 'Carter', 'Collins', 'Cook', 'Cooper', 'Cox', 'Cruz', 'Edwards', 'EvANS', 'Turner', 'Torres', 'Parker', 'Phillips', 'Flores', 'Morris', 'Nguyen', 'Murphy', 'Rivera', 'Cook',
            'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Gomez', 'Kelly', 'Howard', 'Ward', 'Cox', 'Diaz', 'Richardson', 'Wood', 'Watson', 'Brooks', 'Bennett', 'Gray', 'James', 'Reyes',
            'Cruz', 'Hughes', 'Price', 'Myers', 'Long', 'Foster', 'Sanders', 'Ross', 'Morales', 'Powell', 'Sullivan', 'Russell', 'Ortiz', 'Jenkins', 'Gutierrez', 'Perry', 'Butler', 'Barnes', 'Fisher', 'Henderson',
            // 50 additional addresses
            'Alexander', 'Griffin', 'West', 'Jordan', 'Owens', 'Reynolds', 'Ford', 'Hamilton', 'Graham', 'Kim',
            'Patel', 'Singh', 'Shah', 'Khan', 'Chen', 'Wu', 'Huang', 'Zhang', 'Wang', 'Li',
            'Rossi', 'Ferrari', 'Russo', 'Romano', 'Esposito', 'Ricci', 'De Luca', 'Colombo', 'Marino', 'Costa',
            'Castillo', 'Jimenez', 'Romero', 'Alvarez', 'Moreno', 'Ruiz', 'Serrano', 'Molina', 'Rojas', 'Ramos',
            'Grant', 'Spencer', 'Ferguson', 'Wells', 'Tucker', 'Hunter', 'Mcdonald', 'Murray', 'Warren', 'Marshall'
        ];    // Generate business name
    let businessName;
    const namePattern = Math.floor(Math.random() * 8);

    switch (namePattern) {
        case 0: businessName = `${getRandomElement(businessAdjectives)} ${getRandomElement(businessNouns)} ${getRandomElement(businessTypes)}`; break;
        case 1: businessName = `${getRandomElement(businessSurnames)} ${getRandomElement(businessTypes)}`; break;
        case 2: businessName = `${getRandomElement(businessNouns)} ${getRandomElement(businessTypes)}`; break;
        case 3: businessName = `${getRandomElement(businessAdjectives)} ${getRandomElement(businessSurnames)} ${getRandomElement(businessTypes)}`; break;
        case 4: businessName = `${getRandomElement(businessNouns)} & ${getRandomElement(businessNouns)}`; break; // Double noun pattern
        case 5: businessName = `${getRandomElement(businessSurnames)} & ${getRandomElement(businessSurnames)}`; break; // Double surname pattern
        case 6: businessName = `${getRandomElement(businessSurnames)} ${getRandomElement(businessNouns)}`; break; // Surname + Noun pattern
        case 7: businessName = `${getRandomElement(businessAdjectives)} ${getRandomElement(businessNouns)}`; break; // Adjective + Noun without type
        default: businessName = `${getRandomElement(businessAdjectives)} ${getRandomElement(businessNouns)} ${getRandomElement(businessTypes)}`; break;
    }const businessEmailPrefixes = [
            // Original prefixes
            'info', 'contact', 'admin', 'support', 'sales', 'hello', 'office',
            // Additional prefixes
            'inquiries', 'help', 'team', 'service', 'billing', 'finance', 'accounts', 'hr', 'jobs', 'careers',
            'marketing', 'media', 'press', 'communications', 'legal', 'compliance', 'partnerships', 'business',
            'customercare', 'general', 'clientservices', 'operations', 'feedback', 'corporate', 'helpdesk',
            'tech', 'it', 'webmaster', 'noreply', 'services', 'connect', 'community', 'outreach'
        ];
        const businessEmail = getRandomElement(businessEmailPrefixes) + '@' + getRandomElement(employerEmailDomains);// Business positions & departments (for reporter)
        const positions = [
            // Original positions
            'Manager', 'Director', 'Supervisor', 'Coordinator', 'Specialist', 'Administrator', 'Analyst', 'Consultant', 'Associate', 'Representative', 'Advisor', 'Officer', 'Lead', 'VP', 'Head', 'Principal',
            // Additional positions
            'Architect', 'Strategist', 'Executive', 'Partner', 'Chief', 'President', 'Chairperson', 'Coach', 'Facilitator', 'Liaison',
            'Evangelist', 'Advocate', 'Expert', 'Guru', 'Steward', 'Technician', 'Engineer', 'Designer', 'Researcher', 'Scientist',
            'Senior', 'Junior', 'Assistant', 'Deputy', 'Regional', 'Global', 'National', 'Local', 'Remote', 'Interim',
            'Contractor', 'Fellow', 'Apprentice', 'Trainee', 'Intern', 'Co-op', 'Founder', 'Co-founder', 'Owner', 'Entrepreneur'
        ];
        const departments = [
            // Original departments
            'Human Resources', 'Operations', 'Finance', 'Marketing', 'Sales', 'Customer Service', 'IT', 'Administration', 'Support', 'Compliance', 'Benefits', 'Accounting', 'Development', 'Legal', 'Research',
            // Additional departments
            'Product', 'Engineering', 'Design', 'Quality Assurance', 'Business Development', 'Public Relations', 'Strategic Planning', 'Innovation', 'Corporate Communications',
            'Risk Management', 'Supply Chain', 'Procurement', 'Logistics', 'Data Science', 'Artificial Intelligence', 'Machine Learning', 'Cybersecurity', 'Information Security',
            'Analytics', 'Business Intelligence', 'User Experience', 'Customer Success', 'Client Relations', 'Talent Acquisition', 'Employee Relations', 'Training', 'Education',
            'Learning & Development', 'Knowledge Management', 'Project Management', 'Program Management', 'Portfolio Management', 'Mergers & Acquisitions',
            'Corporate Social Responsibility', 'Sustainability', 'Facilities', 'Real Estate', 'Health & Safety', 'Environmental Affairs', 'Government Relations',
            'Regulatory Affairs', 'Tax', 'Treasury', 'Investor Relations', 'Internal Audit', 'Digital Transformation', 'eCommerce', 'Social Media'
        ];

        const locationData = getRandomBusinessAddress();

        return {
            businessName: businessName,
            position: `${getRandomElement(positions)}, ${getRandomElement(departments)}`, // Reporter's position
            email: businessEmail,
            address: locationData.street,
            city: locationData.city,
            state: locationData.state,
            zip: locationData.zip,
            phone: generateBusinessPhone(),
        };
    }    // Create employer profile with job title
    function generateEmployerInfo() {
        const companyTypes = ['Hospital', 'Medical Center', 'Health System', 'Clinic', 'Health Services', 'Care Center', 'Physicians', 'Medical Group', 'Healthcare', 'Wellness Center', 'University', 'Pharmaceuticals', 'Biotech', 'Diagnostics', 'Therapeutics', 'Research Institute'];
        const companyAdjectives = ['City', 'Regional', 'Memorial', 'Community', 'University', 'General', 'County', 'Valley', 'Metropolitan', 'Integrated', 'Sunrise', 'Sunset', 'Bay', 'Mountain', 'River', 'Central', 'Pioneer'];
        const locationNames = ['Fairview', 'Lakeside', 'Parkview', 'Riverside', 'Hillcrest', 'Pinehurst', 'Oakwood', 'Meadowbrook', 'Springfield', 'Burlington', 'Washington', 'Franklin', 'Jefferson', 'Madison', 'Lincoln', 'Grant'];

        // Build employer name
        let employerName;
        const selectedType = getRandomElement(companyTypes);
        const namePattern = Math.floor(Math.random() * 4);

        switch (namePattern) {
            case 0: employerName = `${getRandomElement(locationNames)} ${selectedType}`; break;
            case 1: employerName = `${getRandomElement(companyAdjectives)} ${selectedType}`; break;
            case 2: employerName = `${getRandomElement(locationNames)} ${getRandomElement(companyAdjectives)} ${selectedType}`; break;
            case 3: employerName = `St. ${getRandomElement(locationNames)} ${selectedType}`; break;
            default: employerName = `${getRandomElement(companyAdjectives)} ${selectedType}`; break;
        }

        // *** Determine Job Title based on Employer Type ***
        let jobTitle;
        const isHealthcare = /Hospital|Medical|Health|Clinic|Physician|Care|Pharma|Bio|Diagnostic|Therapeutic|Nurse|Doctor/i.test(employerName) || /Hospital|Medical|Health|Clinic|Physician|Care|Pharma|Bio|Diagnostic|Therapeutic|Nurse|Doctor/i.test(selectedType);
        if (isHealthcare) {
            jobTitle = getRandomElement(healthcareJobTitles);
        } else {
            jobTitle = getRandomElement(businessJobTitles);
        }

        const locationData = getRandomBusinessAddress();
        const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Radiology', 'Emergency Services', 'Primary Care', 'Family Medicine', 'Internal Medicine', 'Surgery', 'Administration', 'Billing', 'IT', 'Human Resources', 'Patient Services'];
        const employerEmailPrefixes = ['hr', 'info', 'contact', 'recruiting', 'admin', 'office', 'careers'];
        const employerEmail = getRandomElement(employerEmailPrefixes) + '@' + getRandomElement(employerEmailDomains);

        return {
            employerName: employerName,
            jobTitle: jobTitle, // *** Include Job Title ***
            department: getRandomElement(departments),
            address: locationData.street,
            city: locationData.city,
            state: locationData.state,
            zip: locationData.zip,
            phone: generateBusinessPhone(),
            email: employerEmail
        };
    }

    // Generate Healthcare Provider information (Uses Healthcare Domains)
    function generateHealthcareInfo() {
        const providerType = ['Health Plan', 'Insurance', 'Healthcare', 'Benefits', 'Medical Plan', 'Group', 'Network', 'Assurance', 'Mutual', 'Health'];
        const providerNames = ['Blue Cross', 'UnitedHealth', 'Aetna', 'Cigna', 'Humana', 'Kaiser Permanente', 'Anthem', 'Wellcare', 'MetLife', 'Nationwide', 'Liberty', 'Guardian', 'Prudential', 'CVS Health', 'Molina', 'Centene', 'Oscar', 'Bright Health'];
        const providerName = `${getRandomElement(providerNames)} ${getRandomElement(providerType)}`;

        function generatePolicyId() {
            const patterns = [
                () => { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; let id = ''; for (let i = 0; i < 9; i++) { id += chars.charAt(Math.floor(Math.random() * chars.length)); if (i === 2 || i === 5) id += '-'; } return id; },
                () => { const prefix = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 23)); return prefix + Math.floor(10000000 + Math.random() * 90000000); },
                () => { return Math.floor(1000000000 + Math.random() * 9000000000).toString(); },
                () => { const prefix = 'W' + Math.floor(100000000 + Math.random() * 900000000); return prefix; } // W + 9 digits pattern
            ];
            return patterns[Math.floor(Math.random() * patterns.length)]();
        }

        function generateGroupNumber() {
            const patterns = [
                () => Math.floor(10000 + Math.random() * 90000).toString(),
                () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 23)) + Math.floor(1000 + Math.random() * 9000),
                () => { const part1 = Math.floor(100 + Math.random() * 900); const part2 = Math.floor(1000 + Math.random() * 9000); return `${part1}-${part2}`; },
                () => `GRP${Math.floor(10000 + Math.random() * 90000)}` // GRP prefix
            ];
            return patterns[Math.floor(Math.random() * patterns.length)]();
        }

        const providerEmailPrefixes = ['info', 'billing', 'claims', 'memberservices', 'contact', 'support', 'providerrelations'];
        const providerEmail = getRandomElement(providerEmailPrefixes) + '@' + getRandomElement(healthcareEmailDomains);

        return {
            providerName: providerName,
            policyId: generatePolicyId(),
            groupNumber: generateGroupNumber(),
            phone: generateBusinessPhone(),
            email: providerEmail
        };
    }

    // Expanded Realistic US Business Addresses
    const businessAddressDatabase = [
        // New York
        {street: '350 Fifth Avenue', city: 'New York', state: 'New York', zip: '10118'}, {street: '30 Rockefeller Plaza', city: 'New York', state: 'New York', zip: '10112'}, {street: '200 Park Avenue', city: 'New York', state: 'New York', zip: '10166'},
        // California
        {street: '1 Apple Park Way', city: 'Cupertino', state: 'California', zip: '95014'}, {street: '1600 Amphitheatre Parkway', city: 'Mountain View', state: 'California', zip: '94043'}, {street: '1 Hacker Way', city: 'Menlo Park', state: 'California', zip: '94025'},
        // Illinois
        {street: '233 S Wacker Dr', city: 'Chicago', state: 'Illinois', zip: '60606'}, {street: '875 N Michigan Ave', city: 'Chicago', state: 'Illinois', zip: '60611'}, {street: '401 N Wabash Ave', city: 'Chicago', state: 'Illinois', zip: '60611'},
        // Texas
        {street: '1 Cowboys Way', city: 'Frisco', state: 'Texas', zip: '75034'}, {street: '1 AT&T Way', city: 'Dallas', state: 'Texas', zip: '75202'}, {street: '2200 Post Oak Blvd', city: 'Houston', state: 'Texas', zip: '77056'},
        // Florida
        {street: '1 Panther Parkway', city: 'Sunrise', state: 'Florida', zip: '33323'}, {street: '1601 Collins Avenue', city: 'Miami Beach', state: 'Florida', zip: '33139'}, {street: '333 SE 2nd Ave', city: 'Miami', state: 'Florida', zip: '33131'},
        // Washington
        {street: '325 9th Ave', city: 'Seattle', state: 'Washington', zip: '98104'}, {street: '400 Broad St', city: 'Seattle', state: 'Washington', zip: '98109'}, {street: '700 Bellevue Way NE', city: 'Bellevue', state: 'Washington', zip: '98004'},
        // Massachusetts
        {street: '1 Beacon Street', city: 'Boston', state: 'Massachusetts', zip: '02108'}, {street: '100 Cambridge Street', city: 'Boston', state: 'Massachusetts', zip: '02114'}, {street: '800 Boylston St', city: 'Boston', state: 'Massachusetts', zip: '02199'},
        // Pennsylvania
        {street: '1735 Market St', city: 'Philadelphia', state: 'Pennsylvania', zip: '19103'}, {street: '600 Grant St', city: 'Pittsburgh', state: 'Pennsylvania', zip: '15219'}, {street: '1 Liberty Pl', city: 'Philadelphia', state: 'Pennsylvania', zip: '19103'},
        // Georgia
        {street: '1 Coca Cola Plz NW', city: 'Atlanta', state: 'Georgia', zip: '30313'}, {street: '3344 Peachtree Rd NE', city: 'Atlanta', state: 'Georgia', zip: '30326'}, {street: '1 CNN Center', city: 'Atlanta', state: 'Georgia', zip: '30303'},
        // Colorado
        {street: '1700 Lincoln St', city: 'Denver', state: 'Colorado', zip: '80203'}, {street: '1670 Broadway', city: 'Denver', state: 'Colorado', zip: '80202'},
        // Arizona
        {street: '2 E Washington St', city: 'Phoenix', state: 'Arizona', zip: '85004'}, {street: '40 E Rio Salado Pkwy', city: 'Tempe', state: 'Arizona', zip: '85281'},
        // North Carolina
        {street: '100 N Tryon St', city: 'Charlotte', state: 'North Carolina', zip: '28202'}, {street: '301 Fayetteville St', city: 'Raleigh', state: 'North Carolina', zip: '27601'},
        // Michigan
        {street: '1001 Woodward Ave', city: 'Detroit', state: 'Michigan', zip: '48226'}, {street: '200 Ottawa Ave NW', city: 'Grand Rapids', state: 'Michigan', zip: '49503'},
        // Nevada
        {street: '3799 Las Vegas Blvd S', city: 'Las Vegas', state: 'Nevada', zip: '89109'}, {street: '1 S Main St', city: 'Las Vegas', state: 'Nevada', zip: '89101'},
        // District of Columbia
        {street: '1600 Pennsylvania Avenue NW', city: 'Washington', state: 'District of Columbia', zip: '20500'}, {street: '1100 New York Ave NW', city: 'Washington', state: 'District of Columbia', zip: '20005'}, {street: '1775 Pennsylvania Ave NW', city: 'Washington', state: 'District of Columbia', zip: '20006'},
        // Ohio
        {street: '45 E 7th St', city: 'Cincinnati', state: 'Ohio', zip: '45202'}, {street: '10 W Broad St', city: 'Columbus', state: 'Ohio', zip: '43215'}, {street: '200 Public Square', city: 'Cleveland', state: 'Ohio', zip: '44114'},        // Missouri        {street: '1 Metropolitan Square', city: 'St. Louis', state: 'Missouri', zip: '63102'}, {street: '1201 Walnut St', city: 'Kansas City', state: 'Missouri', zip: '64106'},
        // MAGA-owned businesses
        {street: '3661 S Maryland Pkwy', city: 'Las Vegas', state: 'Nevada', zip: '89169', phone: '+1 702 735 7900', name: 'Adelson Clinic For Drug Abuse Treatment & Research'},
    ];

    // Expanded Realistic US Residential Addresses
  const residentialAddressDatabase = [
    // New York
    {street: '123 Main Street', city: 'Albany', state: 'New York', zip: '12208'}, {street: '456 Oak Avenue', city: 'Rochester', state: 'New York', zip: '14618'}, {street: '789 Maple Road', city: 'Buffalo', state: 'New York', zip: '14221'},
    // California
    {street: '234 Pine Street', city: 'Los Angeles', state: 'California', zip: '90012'}, {street: '567 Cedar Lane', city: 'San Francisco', state: 'California', zip: '94109'}, {street: '890 Redwood Drive', city: 'San Diego', state: 'California', zip: '92101'},
    // Illinois
    {street: '345 Elm Street', city: 'Chicago', state: 'Illinois', zip: '60614'}, {street: '678 Birch Avenue', city: 'Springfield', state: 'Illinois', zip: '62704'}, {street: '90 Maple Court', city: 'Peoria', state: 'Illinois', zip: '61614'},
    // Texas
    {street: '901 Willow Way', city: 'Houston', state: 'Texas', zip: '77006'}, {street: '112 Sycamore Street', city: 'Dallas', state: 'Texas', zip: '75204'}, {street: '334 Magnolia Boulevard', city: 'Austin', state: 'Texas', zip: '78701'},
    // Florida
    {street: '556 Palm Avenue', city: 'Miami', state: 'Florida', zip: '33139'}, {street: '778 Coconut Lane', city: 'Orlando', state: 'Florida', zip: '32801'}, {street: '990 Orange Drive', city: 'Tampa', state: 'Florida', zip: '33602'},
    // Washington
    {street: '1122 Cherry Street', city: 'Seattle', state: 'Washington', zip: '98104'}, {street: '1334 Fir Road', city: 'Spokane', state: 'Washington', zip: '99201'}, {street: '15 Spruce Way', city: 'Tacoma', state: 'Washington', zip: '98402'},
    // Massachusetts
    {street: '1556 Beacon Street', city: 'Brookline', state: 'Massachusetts', zip: '02446'}, {street: '1778 Commonwealth Avenue', city: 'Boston', state: 'Massachusetts', zip: '02135'}, {street: '19 Harvard Square', city: 'Cambridge', state: 'Massachusetts', zip: '02138'},
    // Pennsylvania
    {street: '2526 Penn Avenue', city: 'Pittsburgh', state: 'Pennsylvania', zip: '15222'}, {street: '27 Lombard St', city: 'Philadelphia', state: 'Pennsylvania', zip: '19147'}, {street: '29 Market Street', city: 'Harrisburg', state: 'Pennsylvania', zip: '17101'},
    // Georgia
    {street: '1920 Peachtree Street', city: 'Atlanta', state: 'Georgia', zip: '30309'}, {street: '31 Oak St', city: 'Savannah', state: 'Georgia', zip: '31401'}, {street: '33 Magnolia Ave', city: 'Augusta', state: 'Georgia', zip: '30901'},
    // Colorado
    {street: '2728 Broadway', city: 'Denver', state: 'Colorado', zip: '80205'}, {street: '35 Aspen Grove', city: 'Boulder', state: 'Colorado', zip: '80302'}, {street: '37 Mountain View Rd', city: 'Colorado Springs', state: 'Colorado', zip: '80903'},
    // Arizona
    {street: '39 Cactus Ln', city: 'Phoenix', state: 'Arizona', zip: '85016'}, {street: '41 Desert Bloom Way', city: 'Tucson', state: 'Arizona', zip: '85719'}, {street: '43 Mesa Dr', city: 'Scottsdale', state: 'Arizona', zip: '85251'},
    // North Carolina
    {street: '45 Dogwood Ln', city: 'Charlotte', state: 'North Carolina', zip: '28205'}, {street: '47 Pine Needle Rd', city: 'Raleigh', state: 'North Carolina', zip: '27609'}, {street: '49 Azalea Path', city: 'Asheville', state: 'North Carolina', zip: '28801'},
    // Michigan
    {street: '2122 Michigan Avenue', city: 'Detroit', state: 'Michigan', zip: '48216'}, {street: '51 Lake Shore Dr', city: 'Grand Rapids', state: 'Michigan', zip: '49503'}, {street: '53 Cherry St', city: 'Ann Arbor', state: 'Michigan', zip: '48104'},
    // Ohio
    {street: '2324 Euclid Avenue', city: 'Cleveland', state: 'Ohio', zip: '44115'}, {street: '55 Buckeye Circle', city: 'Columbus', state: 'Ohio', zip: '43201'}, {street: '57 River Rd', city: 'Cincinnati', state: 'Ohio', zip: '45202'},
    // Missouri
    {street: '59 Arch Way', city: 'St. Louis', state: 'Missouri', zip: '63104'}, {street: '61 Fountain Dr', city: 'Kansas City', state: 'Missouri', zip: '64111'}, {street: '63 Ozark Trail', city: 'Springfield', state: 'Missouri', zip: '65804'},
    // Tennessee
    {street: '3132 Beale Street', city: 'Memphis', state: 'Tennessee', zip: '38103'}, {street: '63 Music Row', city: 'Nashville', state: 'Tennessee', zip: '37203'}, {street: '65 Volunteer Blvd', city: 'Knoxville', state: 'Tennessee', zip: '37916'},
    // Louisiana
    {street: '2930 Canal Street', city: 'New Orleans', state: 'Louisiana', zip: '70119'}, {street: '67 Bayou Rd', city: 'Baton Rouge', state: 'Louisiana', zip: '70802'},
    // Nevada
    {street: '3334 Fremont Street', city: 'Las Vegas', state: 'Nevada', zip: '89101'}, {street: '69 Sierra Ln', city: 'Reno', state: 'Nevada', zip: '89509'},
    // Oregon
    {street: '65 Rose St', city: 'Portland', state: 'Oregon', zip: '97201'}, {street: '67 River Ave', city: 'Eugene', state: 'Oregon', zip: '97401'}, {street: '71 Cascade Way', city: 'Salem', state: 'Oregon', zip: '97301'},
    // Utah
    {street: '69 Temple Sq', city: 'Salt Lake City', state: 'Utah', zip: '84111'}, {street: '73 Canyon Rd', city: 'Provo', state: 'Utah', zip: '84604'},
    // Virginia
    {street: '71 Colonial Pkwy', city: 'Richmond', state: 'Virginia', zip: '23220'}, {street: '73 Ocean View Ave', city: 'Virginia Beach', state: 'Virginia', zip: '23451'}, {street: '75 Blue Ridge Rd', city: 'Charlottesville', state: 'Virginia', zip: '22903'},
    // Wisconsin
    {street: '75 Lake St', city: 'Milwaukee', state: 'Wisconsin', zip: '53202'}, {street: '77 State St', city: 'Madison', state: 'Wisconsin', zip: '53703'}, {street: '79 Packer Ave', city: 'Green Bay', state: 'Wisconsin', zip: '54303'},
    // Minnesota
    {street: '81 Gopher Way', city: 'Minneapolis', state: 'Minnesota', zip: '55401'}, {street: '83 Lake Dr', city: 'St. Paul', state: 'Minnesota', zip: '55101'}, {street: '85 Nordic Trail', city: 'Duluth', state: 'Minnesota', zip: '55802'},
    // Alabama
    {street: '87 Crimson Rd', city: 'Birmingham', state: 'Alabama', zip: '35203'}, {street: '89 Gulf Shore Dr', city: 'Mobile', state: 'Alabama', zip: '36602'}, {street: '91 University Blvd', city: 'Tuscaloosa', state: 'Alabama', zip: '35401'},
    // Connecticut
    {street: '93 Constitution Plaza', city: 'Hartford', state: 'Connecticut', zip: '06103'}, {street: '95 Yale Ave', city: 'New Haven', state: 'Connecticut', zip: '06511'}, {street: '97 Mystic Way', city: 'Stamford', state: 'Connecticut', zip: '06901'},
    // Kentucky
    {street: '99 Bourbon Trail', city: 'Louisville', state: 'Kentucky', zip: '40202'}, {street: '101 Bluegrass Ln', city: 'Lexington', state: 'Kentucky', zip: '40507'}, {street: '103 Derby Dr', city: 'Bowling Green', state: 'Kentucky', zip: '42101'},
    // Iowa
    {street: '105 Corn Row', city: 'Des Moines', state: 'Iowa', zip: '50309'}, {street: '107 River Walk', city: 'Cedar Rapids', state: 'Iowa', zip: '52401'}, {street: '109 University Ave', city: 'Iowa City', state: 'Iowa', zip: '52240'},
    // Oklahoma
    {street: '111 Sooner Path', city: 'Oklahoma City', state: 'Oklahoma', zip: '73102'}, {street: '113 Oil Well Rd', city: 'Tulsa', state: 'Oklahoma', zip: '74103'}, {street: '115 Prairie Dr', city: 'Norman', state: 'Oklahoma', zip: '73069'},
    // South Carolina
    {street: '117 Palmetto Ln', city: 'Charleston', state: 'South Carolina', zip: '29401'}, {street: '119 Gamecock Way', city: 'Columbia', state: 'South Carolina', zip: '29201'}, {street: '121 Ocean Dr', city: 'Myrtle Beach', state: 'South Carolina', zip: '29577'},
    // Arkansas
    {street: '123 Razorback Rd', city: 'Little Rock', state: 'Arkansas', zip: '72201'}, {street: '125 Clinton Ave', city: 'Fayetteville', state: 'Arkansas', zip: '72701'}, {street: '127 Ozark Mountain Dr', city: 'Hot Springs', state: 'Arkansas', zip: '71901'},
    // Kansas
    {street: '129 Sunflower St', city: 'Wichita', state: 'Kansas', zip: '67202'}, {street: '131 Jayhawk Blvd', city: 'Kansas City', state: 'Kansas', zip: '66101'}, {street: '133 Prairie Path', city: 'Topeka', state: 'Kansas', zip: '66603'},
    // New additional addresses - Group 1
    {street: '742 Maplewood Drive', city: 'Springfield', state: 'Illinois', zip: '62704'}, {street: '1238 Oak Ridge Lane', city: 'Austin', state: 'Texas', zip: '78745'}, {street: '59 Birchwood Avenue', city: 'Portland', state: 'Maine', zip: '04101'},
    // New additional addresses - Group 2
    {street: '884 Pinecrest Road', city: 'Charlotte', state: 'North Carolina', zip: '28211'}, {street: '2501 Elm Street', city: 'Denver', state: 'Colorado', zip: '80207'}, {street: '415 Willowbrook Court', city: 'Columbus', state: 'Ohio', zip: '43215'},
    // New additional addresses - Group 3
    {street: '768 Cedar Lane', city: 'Boise', state: 'Idaho', zip: '83702'}, {street: '1023 Aspen Way', city: 'Salt Lake City', state: 'Utah', zip: '84121'}, {street: '538 Magnolia Street', city: 'Savannah', state: 'Georgia', zip: '31401'},
    // New additional addresses - Group 4
    {street: '1910 Chestnut Avenue', city: 'Minneapolis', state: 'Minnesota', zip: '55403'}, {street: '4305 Sycamore Drive', city: 'Nashville', state: 'Tennessee', zip: '37211'}, {street: '2224 Redwood Road', city: 'Sacramento', state: 'California', zip: '95816'},
    // New additional addresses - Group 5
    {street: '811 Holly Street', city: 'Pittsburgh', state: 'Pennsylvania', zip: '15213'}, {street: '1372 Juniper Lane', city: 'Richmond', state: 'Virginia', zip: '23220'}, {street: '304 Poplar Court', city: 'Des Moines', state: 'Iowa', zip: '50312'},
    // New additional addresses - Group 6
    {street: '6624 Fir Street', city: 'Tampa', state: 'Florida', zip: '33612'}, {street: '4542 Dogwood Trail', city: 'Albuquerque', state: 'New Mexico', zip: '87110'}, {street: '379 Oak Hill Road', city: 'Hartford', state: 'Connecticut', zip: '06106'},
    // New additional addresses - Group 7
    {street: '2891 Spruce Avenue', city: 'Oklahoma City', state: 'Oklahoma', zip: '73120'}, {street: '1730 Walnut Street', city: 'Louisville', state: 'Kentucky', zip: '40204'}, {street: '948 Linden Drive', city: 'Madison', state: 'Wisconsin', zip: '53703'},
    // New additional addresses - Group 8
    {street: '2657 Maple Lane', city: 'Raleigh', state: 'North Carolina', zip: '27609'}, {street: '1307 Sycamore Avenue', city: 'Omaha', state: 'Nebraska', zip: '68104'}, {street: '5161 Chestnut Street', city: 'Anchorage', state: 'Alaska', zip: '99504'},
    // New additional addresses - Group 9
    {street: '7496 Elmwood Drive', city: 'Baton Rouge', state: 'Louisiana', zip: '70808'}, {street: '2364 Hickory Road', city: 'Indianapolis', state: 'Indiana', zip: '46205'}, {street: '1830 Cedar Street', city: 'Jacksonville', state: 'Florida', zip: '32207'},
    // New additional addresses - Group 10
    {street: '672 Pine Avenue', city: 'Columbus', state: 'Georgia', zip: '31901'}, {street: '1245 Fir Lane', city: 'Little Rock', state: 'Arkansas', zip: '72211'}, {street: '3902 Redwood Street', city: 'Spokane', state: 'Washington', zip: '99205'},
    // New additional addresses - Group 11
    {street: '823 Spruce Lane', city: 'Charleston', state: 'South Carolina', zip: '29407'}, {street: '1507 Dogwood Drive', city: 'Kansas City', state: 'Missouri', zip: '64109'}, {street: '2904 Oak Street', city: 'Grand Rapids', state: 'Michigan', zip: '49503'},
    // New additional addresses - Group 12
    {street: '4126 Maple Avenue', city: 'Eugene', state: 'Oregon', zip: '97401'}, {street: '6795 Birch Road', city: 'Tucson', state: 'Arizona', zip: '85711'}, {street: '2041 Pine Street', city: 'Fargo', state: 'North Dakota', zip: '58102'},
    // New additional addresses - Group 13
    {street: '735 Chestnut Lane', city: 'New Orleans', state: 'Louisiana', zip: '70118'}, {street: '3172 Poplar Drive', city: 'Providence', state: 'Rhode Island', zip: '02909'}, {street: '1239 Hickory Avenue', city: 'Spokane', state: 'Washington', zip: '99208'},
    // New additional addresses - Group 14
    {street: '456 Elm Street', city: 'Wichita', state: 'Kansas', zip: '67203'}, {street: '1890 Walnut Lane', city: 'Boise', state: 'Idaho', zip: '83712'}, {street: '5786 Fir Street', city: 'Salt Lake City', state: 'Utah', zip: '84105'},
    // New additional addresses - Group 15
    {street: '3457 Sycamore Road', city: 'Oklahoma City', state: 'Oklahoma', zip: '73112'}, {street: '912 Maple Avenue', city: 'Des Moines', state: 'Iowa', zip: '50310'}, {street: '634 Oakwood Drive', city: 'Richmond', state: 'Virginia', zip: '23225'},
    // New additional addresses - Group 16
    {street: '2701 Pinehill Road', city: 'Memphis', state: 'Tennessee', zip: '38117'}, {street: '1582 Cedar Lane', city: 'Pittsburgh', state: 'Pennsylvania', zip: '15217'}, {street: '3749 Spruce Street', city: 'Milwaukee', state: 'Wisconsin', zip: '53211'},
    // New additional addresses - Group 17
    {street: '2830 Birchwood Court', city: 'Minneapolis', state: 'Minnesota', zip: '55416'}, {street: '4601 Elmwood Avenue', city: 'Charlotte', state: 'North Carolina', zip: '28210'}, {street: '3891 Oakridge Lane', city: 'Austin', state: 'Texas', zip: '78758'},
    // New additional addresses - Group 18
    {street: '2765 Willow Creek Road', city: 'Denver', state: 'Colorado', zip: '80220'}, {street: '5039 Pine Hill Avenue', city: 'Charlotte', state: 'North Carolina', zip: '28269'}, {street: '1180 Cedar Grove Street', city: 'Portland', state: 'Oregon', zip: '97225'},
    // New additional addresses - Group 19
    {street: '2349 Birchwood Court', city: 'Columbus', state: 'Ohio', zip: '43215'}, {street: '6712 Elm Street', city: 'Kansas City', state: 'Missouri', zip: '64131'}, {street: '4550 Hickory Lane', city: 'Atlanta', state: 'Georgia', zip: '30342'},
    // New additional addresses - Group 20
    {street: '3207 Juniper Road', city: 'Seattle', state: 'Washington', zip: '98115'}, {street: '5893 Chestnut Drive', city: 'Tampa', state: 'Florida', zip: '33647'}, {street: '1045 Aspen Way', city: 'Salt Lake City', state: 'Utah', zip: '84121'},
    // New additional addresses - Group 21
    {street: '2984 Magnolia Avenue', city: 'Nashville', state: 'Tennessee', zip: '37211'}, {street: '7321 Redwood Street', city: 'San Diego', state: 'California', zip: '92122'}, {street: '4168 Spruce Lane', city: 'Minneapolis', state: 'Minnesota', zip: '55416'},
    // New additional addresses - Group 22
    {street: '8576 Dogwood Drive', city: 'Louisville', state: 'Kentucky', zip: '40228'}, {street: '2103 Sycamore Street', city: 'Omaha', state: 'Nebraska', zip: '68104'}, {street: '3497 Fir Street', city: 'Albuquerque', state: 'New Mexico', zip: '87110'},
    // New additional addresses - Group 23
    {street: '1274 Poplar Avenue', city: 'Richmond', state: 'Virginia', zip: '23223'}, {street: '5630 Cottonwood Drive', city: 'Phoenix', state: 'Arizona', zip: '85032'}, {street: '4312 Alder Street', city: 'Detroit', state: 'Michigan', zip: '48214'},
    // New additional addresses - Group 24
    {street: '6985 Walnut Street', city: 'Milwaukee', state: 'Wisconsin', zip: '53214'}, {street: '2541 Hickory Drive', city: 'Jacksonville', state: 'Florida', zip: '32225'}, {street: '3820 Maple Avenue', city: 'Indianapolis', state: 'Indiana', zip: '46220'},
    // New additional addresses - Group 25
    {street: '1498 Elmwood Drive', city: 'Raleigh', state: 'North Carolina', zip: '27610'}, {street: '5076 Pine Street', city: 'Sacramento', state: 'California', zip: '95822'}, {street: '2713 Oak Lane', city: 'Boston', state: 'Massachusetts', zip: '02135'},
    // New additional addresses - Group 26
    {street: '6349 Cedar Street', city: 'Oklahoma City', state: 'Oklahoma', zip: '73139'}, {street: '1987 Birch Avenue', city: 'Memphis', state: 'Tennessee', zip: '38115'}, {street: '4490 Spruce Street', city: 'Columbus', state: 'Georgia', zip: '31907'},
    // New additional addresses - Group 27
    {street: '3155 Willow Lane', city: 'Hartford', state: 'Connecticut', zip: '06112'}, {street: '7802 Poplar Drive', city: 'Baton Rouge', state: 'Louisiana', zip: '70808'}, {street: '1624 Fir Avenue', city: 'Des Moines', state: 'Iowa', zip: '50315'},
    // New additional addresses - Group 28
    {street: '5291 Chestnut Lane', city: 'Boise', state: 'Idaho', zip: '83704'}, {street: '4037 Maple Drive', city: 'Charleston', state: 'South Carolina', zip: '29414'}, {street: '2869 Alder Avenue', city: 'Grand Rapids', state: 'Michigan', zip: '49504'},
    // New additional addresses - Group 29
    {street: '1358 Dogwood Street', city: 'Little Rock', state: 'Arkansas', zip: '72207'}, {street: '4712 Elm Lane', city: 'Tulsa', state: 'Oklahoma', zip: '74136'}, {street: '3284 Pine Avenue', city: 'Richmond', state: 'California', zip: '94801'},
    // New additional addresses - Group 30
    {street: '5907 Oakwood Drive', city: 'Fargo', state: 'North Dakota', zip: '58102'}, {street: '2149 Cedar Lane', city: 'Anchorage', state: 'Alaska', zip: '99501'}, {street: '6783 Birch Street', city: 'Spokane', state: 'Washington', zip: '99208'},
    // New additional addresses - Group 31
    {street: '3075 Spruce Avenue', city: 'Madison', state: 'Wisconsin', zip: '53711'}, {street: '1540 Maple Lane', city: 'New Orleans', state: 'Louisiana', zip: '70115'}, {street: '4921 Hickory Street', city: 'Reno', state: 'Nevada', zip: '89509'},
    // New additional addresses - Group 32
    {street: '2658 Fir Drive', city: 'Syracuse', state: 'New York', zip: '13210'}, {street: '7134 Poplar Avenue', city: 'Wichita', state: 'Kansas', zip: '67206'}, {street: '3812 Pine Street', city: 'Lubbock', state: 'Texas', zip: '79415'},
    // New additional addresses - Group 33
    {street: '1297 Oak Lane', city: 'Fort Worth', state: 'Texas', zip: '76133'}, {street: '5408 Cedar Avenue', city: 'Chattanooga', state: 'Tennessee', zip: '37421'}, {street: '2985 Elm Street', city: 'Mobile', state: 'Alabama', zip: '36606'},
    // New additional addresses - Group 34
    {street: '1427 Maplewood Drive', city: 'Springfield', state: 'Illinois', zip: '62704'}, {street: '3058 Elm Street', city: 'Boulder', state: 'Colorado', zip: '80302'}, {street: '4892 Cedar Lane', city: 'Raleigh', state: 'North Carolina', zip: '27606'},
    // New additional addresses - Group 35
    {street: '2219 Pine Grove Road', city: 'Boise', state: 'Idaho', zip: '83705'}, {street: '7674 Birchwood Court', city: 'Tampa', state: 'Florida', zip: '33615'}, {street: '1345 Oak Hill Avenue', city: 'Des Moines', state: 'Iowa', zip: '50309'},
    // New additional addresses - Group 36
    {street: '2983 Willow Creek Drive', city: 'Salt Lake City', state: 'Utah', zip: '84117'}, {street: '5109 Aspen Way', city: 'Madison', state: 'Wisconsin', zip: '53711'}, {street: '8736 Chestnut Street', city: 'Portland', state: 'Oregon', zip: '97205'},
    // New additional addresses - Group 37
    {street: '4621 Sycamore Lane', city: 'Columbus', state: 'Ohio', zip: '43215'}, {street: '3287 Redwood Drive', city: 'Sacramento', state: 'California', zip: '95821'}, {street: '1590 Spruce Street', city: 'Richmond', state: 'Virginia', zip: '23220'},
    // New additional addresses - Group 38
    {street: '6845 Poplar Avenue', city: 'Little Rock', state: 'Arkansas', zip: '72205'}, {street: '7532 Dogwood Circle', city: 'Albuquerque', state: 'New Mexico', zip: '87110'}, {street: '2903 Hickory Road', city: 'Louisville', state: 'Kentucky', zip: '40214'},
    // New additional addresses - Group 39
    {street: '4187 Magnolia Street', city: 'Nashville', state: 'Tennessee', zip: '37209'}, {street: '5371 Fir Lane', city: 'Charlotte', state: 'North Carolina', zip: '28211'}, {street: '1224 Cottonwood Drive', city: 'Minneapolis', state: 'Minnesota', zip: '55416'},
    // New additional addresses - Group 40
    {street: '3650 Juniper Street', city: 'Phoenix', state: 'Arizona', zip: '85018'}, {street: '2748 Alder Court', city: 'Kansas City', state: 'Missouri', zip: '64111'}, {street: '4912 Beechwood Avenue', city: 'Hartford', state: 'Connecticut', zip: '06106'},
    // New additional addresses - Group 41
    {street: '8379 Hemlock Drive', city: 'Omaha', state: 'Nebraska', zip: '68124'}, {street: '1567 Larch Street', city: 'Baton Rouge', state: 'Louisiana', zip: '70808'}, {street: '6243 Sequoia Road', city: 'Anchorage', state: 'Alaska', zip: '99501'},
    // New additional addresses - Group 42
    {street: '2035 Walnut Street', city: 'Detroit', state: 'Michigan', zip: '48207'}, {street: '3891 Maple Avenue', city: 'Jacksonville', state: 'Florida', zip: '32207'}, {street: '5780 Aspen Circle', city: 'San Antonio', state: 'Texas', zip: '78230'},
    // New additional addresses - Group 43
    {street: '8146 Cypress Lane', city: 'Indianapolis', state: 'Indiana', zip: '46220'}, {street: '2679 Chestnut Drive', city: 'Providence', state: 'Rhode Island', zip: '02908'}, {street: '4923 Pine Street', city: 'Spokane', state: 'Washington', zip: '99207'},
    // New additional addresses - Group 44
    {street: '3654 Elmwood Avenue', city: 'Cleveland', state: 'Ohio', zip: '44109'}, {street: '7821 Oak Street', city: 'Milwaukee', state: 'Wisconsin', zip: '53212'}, {street: '1348 Birch Lane', city: 'Fargo', state: 'North Dakota', zip: '58102'},
    // New additional addresses - Group 45
    {street: '5692 Spruce Court', city: 'Richmond', state: 'California', zip: '94804'}, {street: '2917 Willow Street', city: 'Salt Lake City', state: 'Utah', zip: '84109'}, {street: '4130 Poplar Avenue', city: 'Tucson', state: 'Arizona', zip: '85711'},
    // New additional addresses - Group 46
    {street: '7423 Hemlock Circle', city: 'Charleston', state: 'South Carolina', zip: '29407'}, {street: '1289 Cedar Lane', city: 'Baton Rouge', state: 'Louisiana', zip: '70806'}, {street: '5617 Fir Street', city: 'Des Moines', state: 'Iowa', zip: '50310'},
    // New additional addresses - Group 47
    {street: '3948 Maplewood Drive', city: 'Albany', state: 'New York', zip: '12203'}, {street: '6175 Alder Avenue', city: 'Fort Worth', state: 'Texas', zip: '76107'}, {street: '2306 Juniper Lane', city: 'Columbus', state: 'Georgia', zip: '31907'},
    // New additional addresses - Group 48
    {street: '4859 Dogwood Drive', city: 'Omaha', state: 'Nebraska', zip: '68106'}, {street: '1594 Pine Grove Road', city: 'Boise', state: 'Idaho', zip: '83704'}, {street: '6783 Chestnut Street', city: 'Memphis', state: 'Tennessee', zip: '38117'},
    // New additional addresses - Group 49
    {street: '3147 Willow Lane', city: 'Oklahoma City', state: 'Oklahoma', zip: '73120'}, {street: '7410 Birchwood Avenue', city: 'Raleigh', state: 'North Carolina', zip: '27615'}, {street: '2958 Oak Hill Drive', city: 'Louisville', state: 'Kentucky', zip: '40205'},
    // New additional addresses - Group 50    {street: '5823 Spruce Street', city: 'San Diego', state: 'California', zip: '92117'}, {street: '1347 Fir Lane', city: 'Albuquerque', state: 'New Mexico', zip: '87111'}, {street: '3941 Cedar Court', city: 'Lexington', state: 'Kentucky', zip: '40502'},
    // Elon Musk's Addresses    {street: '1 Rocket Road', city: 'Hawthorne', state: 'California', zip: '90250'}, {street: '3500 Deer Creek Road', city: 'Palo Alto', state: 'California', zip: '94304'}, {street: '1355 Market Street', city: 'San Francisco', state: 'California', zip: '94103'},
    {street: '15612 Impact Way', city: 'Pflugerville', state: 'Texas', zip: '78660'}, {street: '3500 Deer Creek Road, c/o Public Relations Dept.', city: 'Palo Alto', state: 'California', zip: '94304'},
    // MAGA personal info
    {street: '1600 Pennsylvania Avenue NW', city: 'Washington', state: 'District of Columbia', zip: '20500'}
  ];

    function getRandomBusinessAddress() {
        return getRandomElement(businessAddressDatabase);
    }

    function getRandomResidentialAddress() {
        let address = getRandomElement(residentialAddressDatabase);
        if (!address) return { street: '', city: '', state: '', zip: '' }; // Handle case where database might be empty

        // For residential addresses, randomize the house number for more variation
        const houseNumber = Math.floor(Math.random() * 9900) + 100;

        // Extract the street name without the number
        const streetParts = address.street.split(' ');
        if (streetParts.length > 1 && /^\d+$/.test(streetParts[0])) { // Check if first part is a number
            streetParts.shift(); // Remove the first element (original house number)
        }

        // Create a new street address with the random house number
        address = {
            ...address,
            street: `${houseNumber} ${streetParts.join(' ')}`
        };

        return address;
    }    function generateBusinessPhone() {
        // Use one of the valid area codes
        const area = getRandomElement(validAreaCodes);

        // Generate prefix (avoid codes starting with 0 or 1)
        const prefix = Math.floor(Math.random() * 800) + 200;

        // Generate line number
        const lineNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

        // Return in the exact format (xxx)-xxx-xxxx
        return `(${area})-${prefix}-${lineNum}`;
    }

    // Generate a realistic random birth date for ages 18-85
    function generateRandomBirthDate() {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        // Generate an age between 18-85
        const age = Math.floor(Math.random() * (85 - 18 + 1)) + 18;
        const birthYear = currentYear - age;

        // Random month (1-12) and day (1-28/30/31)
        const month = Math.floor(Math.random() * 12) + 1;

        // Determine max days based on month (simplified without leap year handling)
        let maxDays;
        if ([4, 6, 9, 11].includes(month)) {
            maxDays = 30; // April, June, September, November
        } else if (month === 2) {
            maxDays = 28; // February (ignoring leap years for simplicity)
        } else {
            maxDays = 31; // Other months
        }

        const day = Math.floor(Math.random() * maxDays) + 1;

        // Format as MM/DD/YYYY
        const formattedMonth = month.toString().padStart(2, '0');
        const formattedDay = day.toString().padStart(2, '0');

        return `${formattedMonth}/${formattedDay}/${birthYear}`;
    }

    // Generate alternates if needed for validation issues
    function generateAlternatePhoneFormats(basePhone) {
        if (!basePhone) return ['(555)-555-5555', '555-555-5555', '5555555555']; // Fallback if basePhone is invalid
        // Parse the base phone number
        const matches = basePhone.match(/\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);
        if (!matches || matches.length < 4) return [`${basePhone}`, `${basePhone.replace(/\D/g, '')}`]; // Return original and numeric if parse fails

        const area = matches[1];
        const prefix = matches[2];
        const lineNum = matches[3];

        // Return an array of different formats
        return [
            `(${area})-${prefix}-${lineNum}`, // Format: (xxx)-xxx-xxxx
            `${area}-${prefix}-${lineNum}`,   // Format: xxx-xxx-xxxx
            `${area}${prefix}${lineNum}`,     // Format: xxxxxxxxxx
            `${area} ${prefix} ${lineNum}`,   // Format: xxx xxx xxxx
            `${area}.${prefix}.${lineNum}`    // Format: xxx.xxx.xxxx
        ];
    }

    // Helper function to check if a field likely belongs to a specific section based on keywords
    function getFieldSection(field) {
        const name = field.name?.toLowerCase() || '';
        const id = field.id?.toLowerCase() || '';
        const placeholder = field.placeholder?.toLowerCase() || '';
        // Look for labels associated with the field
        let label = '';
        const labelElement = field.closest('label') || (field.id ? document.querySelector(`label[for="${field.id}"]`) : null);
        if (labelElement) {
            label = labelElement.textContent?.toLowerCase() || '';
        }
        // Check parent elements for section headings (might need adjustment based on actual form structure)
        let parentText = '';
        let currentElement = field.parentElement;
        for (let i=0; i<3 && currentElement; i++) { // Check up to 3 levels up
             const heading = currentElement.querySelector('h1, h2, h3, h4, legend, .section-title'); // Common heading/title elements
             if (heading) {
                 parentText += (heading.textContent?.toLowerCase() || '') + ' ';
             }
             // Check for text nodes directly within the parent that might act as labels
             Array.from(currentElement.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                    parentText += node.textContent.toLowerCase().substring(0, 50) + ' '; // Limit length
                }
             });
             parentText += (currentElement.getAttribute('aria-label')?.toLowerCase() || '') + ' '; // Check aria-label
             currentElement = currentElement.parentElement;
        }
        parentText = parentText.trim().replace(/\s+/g, ' '); // Normalize spaces


        if (name.includes('employer') || id.includes('employer') || placeholder.includes('employer') || label.includes('employer') || parentText.includes('employer information')) {
            return 'employer';
        }
        if (name.includes('provider') || id.includes('provider') || placeholder.includes('provider') || label.includes('provider') ||
            name.includes('hospital') || id.includes('hospital') || placeholder.includes('hospital') || label.includes('hospital') ||
            name.includes('doctor') || id.includes('doctor') || placeholder.includes('doctor') || label.includes('doctor') ||
            name.includes('insurance') || id.includes('insurance') || placeholder.includes('insurance') || label.includes('insurance') ||
            name.includes('policy') || id.includes('policy') || placeholder.includes('policy') || label.includes('policy') ||
            name.includes('group') || id.includes('group') || placeholder.includes('group') || label.includes('group') ||
            parentText.includes('health care provider') || parentText.includes('responsible provider') || parentText.includes('insurance information')) {
            return 'provider';
        }
        // Check for reporter's business - less common, might need specific keywords
        if (name.includes('business') || id.includes('business') || placeholder.includes('business') || label.includes('business') ||
            name.includes('company') || id.includes('company') || placeholder.includes('company') || label.includes('company')) {
             // Avoid matching employer fields again
             if (!name.includes('employer') && !id.includes('employer') && !placeholder.includes('employer') && !label.includes('employer') && !parentText.includes('employer information')) {
                 return 'business'; // Reporter's business
             }
        }
        // Check for section context like "Your details"
        if (parentText.includes('your details') || parentText.includes('reporter details') || parentText.includes('personal information') || parentText.includes('contact information')) {
             // Check if it's NOT within an employer/provider/business context already identified higher up
             let isOtherSection = false;
             let checkParent = field.parentElement;
             for(let i=0; i<3 && checkParent; i++) {
                 const parentId = checkParent.id?.toLowerCase() || '';
                 const parentClass = checkParent.className?.toLowerCase() || '';
                 if (parentId.includes('employer') || parentId.includes('provider') || parentId.includes('business') ||
                     parentClass.includes('employer') || parentClass.includes('provider') || parentClass.includes('business')) {
                     isOtherSection = true;
                     break;
                 }
                 checkParent = checkParent.parentElement;
             }
             if (!isOtherSection) return 'personal';
        }

        // Default to personal/residential if no other context found
        return 'personal';
    }
    // Detect CAPTCHA presence
    async function handleCaptcha() {
        const captchaElements = [
            ...document.querySelectorAll('iframe[src*="captcha"]'),
            ...document.querySelectorAll('iframe[src*="recaptcha"]'),
            ...document.querySelectorAll('div.g-recaptcha'),
            ...document.querySelectorAll('div[class*="captcha"]'),
            ...document.querySelectorAll('input[name*="captcha"]'),
            ...document.querySelectorAll('img[alt*="captcha" i]')
        ];

        if (captchaElements.length > 0) {
            console.log("Captcha detected");
            waitingForCaptcha = true;
            updateStatus("Manual captcha required");
            console.warn("Please solve the captcha and submit the form manually");
            return false;
        }

        return true;
    }    // Trigger form events to simulate user input
    function dispatchEvents(field) {
        if (!field) return;
        try {
            field.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            field.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            field.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));

            if (document.activeElement === field) {
                field.blur();
            }
        } catch (e) {
             console.warn("Could not dispatch event on field:", field, e);
        }
    }

    // --- fillForm function ---
    async function fillForm() {
        try {
            console.log("Generating distinct form data...");
            updateStatus("Generating data...");

            // Create a new form data object to track changes
            const formData = {};

            // Generate all needed information distinctly
            const personalInfo = generateIdentity(); // Now includes middleName and optional suffix
            const residentialAddress = getRandomResidentialAddress();
            const businessInfo = generateBusinessInfo(); // Reporter's business details (includes reporter's position)
            const employerInfo = generateEmployerInfo(); // User's employer details (includes contextual job title)
            const healthcareInfo = generateHealthcareInfo();
            const healthcareProviderAddress = getRandomBusinessAddress();

            // Store generated data (optional, for debugging or comparison)
            formData.personalInfo = personalInfo;
            formData.residentialAddress = residentialAddress;
            formData.businessInfo = businessInfo;
            formData.employerInfo = employerInfo;
            formData.healthcareInfo = healthcareInfo;
            formData.healthcareProviderAddress = healthcareProviderAddress;

            console.log("Filling form with distinct data...");
            updateStatus("Filling form...");

            // Find and select "No" for "Has this already been reported"
            const noRadioButtons = document.querySelectorAll('input[type="radio"][value="No"], input[type="radio"][value="no"]');
            if (noRadioButtons.length > 0) {
                for (const radio of noRadioButtons) {
                    const name = radio.name?.toLowerCase() || '';
                    const parentText = (radio.closest('label')?.textContent || radio.parentElement?.textContent || '').toLowerCase();
                    if (name.includes("reported") || parentText.includes("already reported")) {
                        console.log("Setting 'No' for report question");
                        if (!radio.checked) {
                            radio.click(); // Use click for radios
                            dispatchEvents(radio); // Still dispatch events
                        }
                        break;
                    }
                }
            }

            // Randomly choose between consent disclosure options
            const consentRadios = document.querySelectorAll('input[type="radio"]');
            if (consentRadios.length > 0) {
                const consentOptions = Array.from(consentRadios).filter(radio => {
                    const name = radio.name?.toLowerCase() || '';
                    const parentText = (radio.closest('label')?.textContent || radio.parentElement?.textContent || '').toLowerCase();
                    return name.includes("consent") || name.includes("disclos") || name.includes("confidential") ||
                           parentText.includes("consent") || parentText.includes("disclos") || parentText.includes("confidential");
                });

                if (consentOptions.length > 0) {
                    const groups = {};
                    consentOptions.forEach(radio => {
                        if (!groups[radio.name]) groups[radio.name] = [];
                        groups[radio.name].push(radio);
                    });
                    for (const name in groups) {
                         const selectedOption = getRandomElement(groups[name]);
                         if (!selectedOption.checked) {
                            selectedOption.click(); // Use click for radios
                            dispatchEvents(selectedOption); // Still dispatch events
                            console.log(`Randomly selected consent option for ${name}: ${selectedOption.value}`);
                         }
                    }
                }
            }

            // --- Fill name fields ---
            // *** FIX: Added :not([type="submit"]) to prevent matching submit buttons ***
            const firstNameFields = document.querySelectorAll('input[name*="first" i]:not([name*="last" i]):not([name*="middle" i]):not([type="submit"]), input[placeholder*="First" i]:not([placeholder*="Last" i]):not([placeholder*="Middle" i]):not([type="submit"]), input[id*="first" i]:not([id*="last" i]):not([id*="middle" i]):not([type="submit"])');
            for (const field of firstNameFields) {
                if (field.type !== 'hidden' && field.offsetParent !== null) { // Check if visible
                    field.value = personalInfo.firstName;
                    dispatchEvents(field);
                }
            }

            // *** FIX: Added :not([type="submit"]) to prevent matching submit buttons ***
            const lastNameFields = document.querySelectorAll('input[name*="last" i]:not([name*="first" i]):not([name*="middle" i]):not([type="submit"]), input[placeholder*="Last" i]:not([placeholder*="First" i]):not([placeholder*="Middle" i]):not([type="submit"]), input[id*="last" i]:not([id*="first" i]):not([id*="middle" i]):not([type="submit"])');
            for (const field of lastNameFields) {
                 if (field.type !== 'hidden' && field.offsetParent !== null) { // Check if visible
                    field.value = personalInfo.lastName;
                    dispatchEvents(field);
                 }
            }

            // *** FIX: Added :not([type="submit"]) to prevent matching submit buttons ***
            const middleNameFields = document.querySelectorAll('input[name*="middle" i]:not([type="submit"]), input[placeholder*="Middle" i]:not([type="submit"]), input[id*="middle" i]:not([type="submit"]), input[name*="mi" i]:not([type="submit"]), input[placeholder*="MI" i]:not([type="submit"]), input[id*="mi" i]:not([type="submit"])');
            for (const field of middleNameFields) {
                 if (field.type !== 'hidden' && field.offsetParent !== null) { // Check if visible
                    if (field.name?.toLowerCase().includes('initial') || field.placeholder?.toLowerCase().includes('initial') || field.id?.toLowerCase().includes('initial') || field.name?.toLowerCase() === 'mi' || field.id?.toLowerCase() === 'mi' || field.maxLength === 1) {
                        field.value = personalInfo.middleName.charAt(0);
                    } else {
                        field.value = personalInfo.middleName;
                    }
                    dispatchEvents(field);
                 }
            }

            // *** Fill Suffix fields (only if suffix exists) ***
            if (personalInfo.suffix) {
                 // *** FIX: Added :not([type="submit"]) to prevent matching submit buttons ***
                 const suffixFields = document.querySelectorAll('input[name*="suffix" i]:not([type="submit"]), input[placeholder*="Suffix" i]:not([type="submit"]), input[id*="suffix" i]:not([type="submit"]), input[placeholder*="Jr" i]:not([type="submit"]), input[placeholder*="Sr" i]:not([type="submit"])');
                 for (const field of suffixFields) {
                     if (field.type !== 'hidden' && field.offsetParent !== null) { // Check if visible
                        field.value = personalInfo.suffix;
                        dispatchEvents(field);
                     }
                 }
                 // Also check select dropdowns for suffixes
                 const suffixSelects = document.querySelectorAll('select[name*="suffix" i], select[id*="suffix" i]');
                 for (const select of suffixSelects) {
                     if (select.offsetParent !== null) { // Check if visible
                         const options = Array.from(select.options);
                         const suffixOption = options.find(opt => opt.text.toLowerCase() === personalInfo.suffix.toLowerCase() || opt.value.toLowerCase() === personalInfo.suffix.toLowerCase() || opt.text.toLowerCase().startsWith(personalInfo.suffix.toLowerCase().replace('.', '')));
                         if (suffixOption) {
                             select.value = suffixOption.value;
                             dispatchEvents(select);
                         }
                     }
                 }            }

            // Fill Date of Birth fields (with 17% probability)
            const birthDateFields = document.querySelectorAll(
                'input[type="text"][name*="birth" i], input[type="text"][name*="dob" i], input[type="text"][placeholder*="birth" i], input[type="text"][placeholder*="dob" i], ' +
                'input[type="text"][id*="birth" i], input[type="text"][id*="dob" i], input[type="text"][aria-label*="birth" i], input[type="text"][aria-label*="dob" i], ' +
                'input[type="date"][name*="birth" i], input[type="date"][name*="dob" i], input[type="date"][placeholder*="birth" i], input[type="date"][placeholder*="dob" i], ' +
                'input[type="date"][id*="birth" i], input[type="date"][id*="dob" i], input[type="date"][aria-label*="birth" i], input[type="date"][aria-label*="dob" i]'
            );

            // Only fill date of birth fields ~17% of the time
            const shouldFillDOB = Math.random() < 0.17;

            if (shouldFillDOB && birthDateFields.length > 0) {
                console.log("Filling date of birth fields (17% probability triggered)");
                const birthDate = generateRandomBirthDate();
                for (const field of birthDateFields) {
                    if (field.offsetParent !== null && !field.disabled && !field.readOnly) { // Check if visible and enabled
                        if (field.type === 'date') {
                            // Convert MM/DD/YYYY to YYYY-MM-DD for date input
                            const dateParts = birthDate.split('/');
                            if (dateParts.length === 3) {
                                field.value = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`;
                            } else {
                                field.value = new Date().toISOString().split('T')[0]; // Fallback
                            }
                        } else {
                            field.value = birthDate; // Use MM/DD/YYYY format for text inputs
                        }
                        dispatchEvents(field);
                        console.log(`Filled date of birth field (${field.name || field.id}) with: ${field.value}`);
                    }
                }
            } else if (birthDateFields.length > 0) {
                console.log("Skipping date of birth fields (83% probability)");
            }

            // Fill Full name fields / Provider Name / Employer Name / Business Name (excluding first/last/middle/suffix specific fields AND submit buttons)
            const nameFields = document.querySelectorAll(
                'input[type="text"][name*="name" i]:not([name*="first" i]):not([name*="last" i]):not([name*="middle" i]):not([name*="suffix" i]), ' + // Already excludes submit by type=text
                'input[type="text"][placeholder*="Name" i]:not([placeholder*="First" i]):not([placeholder*="Last" i]):not([placeholder*="Middle" i]):not([placeholder*="Suffix" i]), ' +
                'input[type="text"][id*="name" i]:not([id*="first" i]):not([id*="last" i]):not([id*="middle" i]):not([id*="suffix" i]), ' +
                'input[type="text"][name*="provider" i], input[type="text"][placeholder*="Provider" i], ' +
                'input[type="text"][name*="hospital" i], input[type="text"][placeholder*="Hospital" i], ' +
                'input[type="text"][name*="employer" i], input[type="text"][placeholder*="Employer" i], ' +
                'input[type="text"][name*="company" i]:not([name*="employer"]), input[type="text"][placeholder*="Company" i]:not([placeholder*="Employer"]), ' + // Try to avoid employer company
                'input[type="text"][name*="business" i], input[type="text"][placeholder*="Business" i]'
            );
            for (const field of nameFields) {
                 if (field.type !== 'hidden' && field.offsetParent !== null) { // Check if visible
                    const section = getFieldSection(field);
                    let valueToSet = '';
                    switch (section) {
                        case 'employer':
                            valueToSet = employerInfo.employerName;
                            break;
                        case 'provider':
                             // Avoid setting provider name if it looks like a person's name field
                            if (!field.name?.match(/first|last|middle|person/i) && !field.placeholder?.match(/first|last|middle|person/i) && !field.id?.match(/first|last|middle|person/i)) {
                                valueToSet = healthcareInfo.providerName;
                            }
                            break;
                        case 'business': // Reporter's business
                            valueToSet = businessInfo.businessName;
                            break;
                        case 'personal': // Default to personal full name
                        default:
                            // Only fill if it doesn't seem to be first/last/middle/suffix name specifically
                            if (!field.name?.match(/first|last|middle|initial|suffix/i) && !field.placeholder?.match(/first|last|middle|initial|suffix/i) && !field.id?.match(/first|last|middle|initial|suffix/i) &&
                                !field.name?.match(/provider|hospital|employer|company|business/i) && !field.placeholder?.match(/provider|hospital|employer|company|business/i) && !field.id?.match(/provider|hospital|employer|company|business/i) ) {
                                valueToSet = personalInfo.firstName + ' ' + personalInfo.lastName;
                            }
                            break;
                    }
                    if (valueToSet) {
                        field.value = valueToSet;
                        dispatchEvents(field);
                    }
                }
            }

            // Fill email fields (using categorized domains)
            const emailFields = document.querySelectorAll('input[type="email"], input[type="text"][name*="email" i]:not([type="submit"]), input[type="text"][placeholder*="email" i]:not([type="submit"]), input[type="text"][id*="email" i]:not([type="submit"])');
            for (const field of emailFields) {
                 if (field.type !== 'hidden' && field.offsetParent !== null) { // Check if visible
                    const section = getFieldSection(field);
                    switch (section) {
                        case 'employer': field.value = employerInfo.email; break;
                        case 'provider': field.value = healthcareInfo.email; break;
                        case 'business': field.value = businessInfo.email; break;
                        case 'personal': default: field.value = personalInfo.email; break;
                    }
                    dispatchEvents(field);
                 }
            }

            // Fill address fields (Street)
            const addressFields = document.querySelectorAll('input[type="text"][name*="address" i], input[type="text"][name*="street" i], input[type="text"][placeholder*="Address" i], input[type="text"][placeholder*="Street" i], input[type="text"][id*="address" i], input[type="text"][id*="street" i]');
            for (const field of addressFields) {
                 if (field.type !== 'hidden' && field.offsetParent !== null) { // Check if visible
                     // Skip address line 2/3 etc.
                     if (field.name?.match(/address.?2|address.?3|line.?2|line.?3/i) || field.placeholder?.match(/address.?2|address.?3|line.?2|line.?3/i) || field.id?.match(/address.?2|address.?3|line.?2|line.?3/i)) continue;

                    const section = getFieldSection(field);
                    switch (section) {
                        case 'employer': field.value = employerInfo.address; break;
                        case 'provider': field.value = healthcareProviderAddress.street; break;
                        case 'business': field.value = businessInfo.address; break;
                        case 'personal': default: field.value = residentialAddress.street; break;
                    }
                    dispatchEvents(field);
                }
            }

            // Fill city fields
            const cityFields = document.querySelectorAll('input[type="text"][name*="city" i], input[type="text"][placeholder*="City" i], input[type="text"][id*="city" i]');
            for (const field of cityFields) {
                 if (field.type !== 'hidden' && field.offsetParent !== null) { // Check if visible
                    const section = getFieldSection(field);
                    switch (section) {
                        case 'employer': field.value = employerInfo.city; break;
                        case 'provider': field.value = healthcareProviderAddress.city; break;
                        case 'business': field.value = businessInfo.city; break;
                        case 'personal': default: field.value = residentialAddress.city; break;
                    }
                    dispatchEvents(field);
                 }
            }

            // Select state from dropdown
            const stateSelects = document.querySelectorAll('select[name*="state" i], select[id*="state" i]');
            for (const select of stateSelects) {
                 if (select.offsetParent !== null) { // Check if visible
                    const section = getFieldSection(select);
                    let targetState;
                    switch (section) {
                        case 'employer': targetState = employerInfo.state; break;
                        case 'provider': targetState = healthcareProviderAddress.state; break;
                        case 'business': targetState = businessInfo.state; break;
                        case 'personal': default: targetState = residentialAddress.state; break;
                    }
                    const options = Array.from(select.options);
                    // Try matching full name first, then abbreviation
                    let stateOption = options.find(opt => opt.text.toLowerCase() === targetState.toLowerCase() || opt.value.toLowerCase() === targetState.toLowerCase());
                    if (!stateOption) {
                        const stateAbbreviation = getStateAbbreviation(targetState); // Helper needed
                        if (stateAbbreviation) {
                             stateOption = options.find(opt => opt.value.toLowerCase() === stateAbbreviation.toLowerCase() || opt.text.toLowerCase() === stateAbbreviation.toLowerCase());
                        }
                    }

                    if (stateOption) {
                         select.value = stateOption.value;
                         dispatchEvents(select);
                    } else {
                         console.warn(`Could not find state option for ${targetState} in select element:`, select);
                         // Attempt to fill corresponding text input if select fails
                         const stateTextInput = document.querySelector(`input[type="text"][name*="state"][id*="${select.id.replace('select', '')}"], input[type="text"][name*="state"][aria-labelledby*="${select.id}"]`);
                         if (stateTextInput && stateTextInput.offsetParent !== null) {
                             stateTextInput.value = targetState;
                             dispatchEvents(stateTextInput);
                             console.log(`Filled text input fallback for state: ${targetState}`);
                         }
                    }
                 }
            }

            // Fill zip code fields
            const zipFields = document.querySelectorAll('input[type="text"][name*="zip" i], input[type="text"][name*="postal" i], input[type="text"][placeholder*="Zip" i], input[type="text"][placeholder*="Postal" i], input[type="text"][id*="zip" i], input[type="text"][id*="postal" i]');
            for (const field of zipFields) {
                 if (field.type !== 'hidden' && field.offsetParent !== null && !field.disabled && !field.readOnly) { // Check if visible and enabled
                    const section = getFieldSection(field);
                    switch (section) {
                        case 'employer': field.value = employerInfo.zip; break;
                        case 'provider': field.value = healthcareProviderAddress.zip; break;
                        case 'business': field.value = businessInfo.zip; break;
                        case 'personal': default: field.value = residentialAddress.zip; break;
                    }
                    dispatchEvents(field);
                 }
            }

            // Fill phone fields
            const phoneFields = document.querySelectorAll('input[type="tel"], input[type="text"][name*="phone" i]:not([type="submit"]), input[type="text"][placeholder*="phone" i]:not([type="submit"]), input[type="text"][id*="phone" i]:not([type="submit"])');
            for (const field of phoneFields) {
                 if (field.type !== 'hidden' && field.offsetParent !== null && !field.disabled && !field.readOnly) { // Check if visible and enabled
                     // Skip fax fields
                     if (field.name?.toLowerCase().includes('fax') || field.placeholder?.toLowerCase().includes('fax') || field.id?.toLowerCase().includes('fax')) continue;

                    const section = getFieldSection(field);
                    let phoneNumber;
                    switch (section) {
                        case 'employer': phoneNumber = employerInfo.phone; break;
                        case 'provider': phoneNumber = healthcareInfo.phone; break;
                        case 'business': phoneNumber = businessInfo.phone; break;
                        case 'personal': default: phoneNumber = personalInfo.phone; break;
                    }
                    field.value = phoneNumber;
                    dispatchEvents(field);

                    // Attempt to force value if masked input clears it
                    await new Promise(resolve => setTimeout(resolve, 150)); // Wait for potential masking
                    if (field.value === '' || (field.value.replace(/\D/g,'').length < 10 && phoneNumber.replace(/\D/g,'').length >= 10)) {
                        console.log(`Phone field ${field.name || field.id} might be masked/cleared, attempting reset to: ${phoneNumber}`);
                        field.value = ''; // Clear first
                        dispatchEvents(field); // Dispatch after clear
                        await new Promise(resolve => setTimeout(resolve, 50));
                        field.value = phoneNumber; // Set again
                        dispatchEvents(field); // Dispatch after set
                    }
                }
            }

        // Fill policy/member ID fields
            const policyFields = document.querySelectorAll('input[name*="policy" i]:not([type="submit"]), input[name*="member" i]:not([type="submit"]), input[name*="subscriber" i]:not([type="submit"]), input[placeholder*="Policy" i]:not([type="submit"]), input[placeholder*="Member" i]:not([type="submit"]), input[placeholder*="Subscriber" i]:not([type="submit"]), input[id*="policy" i]:not([type="submit"]), input[id*="member" i]:not([type="submit"]), input[id*="subscriber" i]:not([type="submit"])');
            for (const field of policyFields) {
                 if (field.type !== 'hidden' && field.offsetParent !== null) { // If visible
                    const lcName = field.name?.toLowerCase() || '';
                    const lcPlaceholder = field.placeholder?.toLowerCase() || '';
                    const lcId = field.id?.toLowerCase() || '';
                    // Ensure it's likely an ID field and not something else like 'policy holder name'
                    if ((lcName.includes('policy') || lcName.includes('member') || lcName.includes('subscriber') || lcPlaceholder.includes('policy') || lcPlaceholder.includes('member') || lcPlaceholder.includes('subscriber') || lcId.includes('policy') || lcId.includes('member') || lcId.includes('subscriber')) &&
                        (lcName.includes('id') || lcName.includes('number') || lcName.includes('num') || lcPlaceholder.includes('id') || lcPlaceholder.includes('number') || lcPlaceholder.includes('num') || lcId.includes('id') || lcId.includes('number') || lcId.includes('num') || !lcName.includes('name')) && // Check for ID/Number or lack of 'name'
                        !lcName.includes('website') && !lcPlaceholder.includes('website')) {
                        field.value = healthcareInfo.policyId;
                        dispatchEvents(field);
                    }
                }
            }

            // Fill group number fields (Assumed to be always provider related)
            const groupFields = document.querySelectorAll('input[name*="group" i]:not([type="submit"]), input[placeholder*="Group" i]:not([type="submit"]), input[id*="group" i]:not([type="submit"])');
            for (const field of groupFields) {
                 if (field.type !== 'hidden' && field.offsetParent !== null) { // Check if visible
                     const section = getFieldSection(field);
                     // Ensure it's likely a group number field
                     const lcName = field.name?.toLowerCase() || '';
                     const lcPlaceholder = field.placeholder?.toLowerCase() || '';
                     const lcId = field.id?.toLowerCase() || '';
                     if ((lcName.includes('group') || lcPlaceholder.includes('group') || lcId.includes('group')) &&
                         (lcName.includes('number') || lcName.includes('num') || lcPlaceholder.includes('number') || lcPlaceholder.includes('num') || lcId.includes('number') || lcId.includes('num') || !lcName.includes('name'))) { // Check for Number or lack of 'name'
                         if (section === 'provider') {
                            field.value = healthcareInfo.groupNumber;
                            dispatchEvents(field);
                         }
                     }
                 }
            }

            // Fill position/title fields
            const positionFields = document.querySelectorAll('input[name*="position" i]:not([type="submit"]), input[name*="title" i]:not([type="submit"]), input[name*="job" i]:not([type="submit"]), input[placeholder*="Position" i]:not([type="submit"]), input[placeholder*="Title" i]:not([type="submit"]), input[placeholder*="Job" i]:not([type="submit"]), input[id*="position" i]:not([type="submit"]), input[id*="title" i]:not([type="submit"]), input[id*="job" i]:not([type="submit"])');
            for (const field of positionFields) {
                 if (field.type !== 'hidden' && field.offsetParent !== null) { // Check if visible
                     const section = getFieldSection(field);
                     if (section === 'employer') {
                         // *** Use Employer's Job Title ***
                         field.value = employerInfo.jobTitle;
                         dispatchEvents(field);
                     } else if (section === 'business' || section === 'personal') { // Assume reporter's position if in business/personal section
                         // Use Reporter's Position
                         field.value = businessInfo.position;
                         dispatchEvents(field);
                     }
                 }
            }

            // Fill department fields (Assumed to be USER's department in their employer)
            const departmentFields = document.querySelectorAll('input[name*="department" i]:not([type="submit"]), input[name*="division" i]:not([type="submit"]), input[placeholder*="Department" i]:not([type="submit"]), input[placeholder*="Division" i]:not([type="submit"]), input[id*="department" i]:not([type="submit"]), input[id*="division" i]:not([type="submit"])');
            for (const field of departmentFields) {
                 if (field.type !== 'hidden' && field.offsetParent !== null) { // Check if visible
                     const section = getFieldSection(field);
                     if (section === 'employer') {
                        field.value = employerInfo.department;
                        dispatchEvents(field);
                     }
                 }
            }

        // Fill relationship to provider field
            const relationshipInputFields = document.querySelectorAll('input[type="text"][name*="relationship" i]:not([type="submit"]), input[type="text"][placeholder*="Relationship" i]:not([type="submit"]), input[type="text"][id*="relationship" i]:not([type="submit"]), input[type="text"][name*="relation" i]:not([type="submit"]), input[type="text"][placeholder*="Relation" i]:not([type="submit"]), input[type="text"][id*="relation" i]:not([type="submit"])');
            let relationshipSet = false;
            if (relationshipInputFields.length > 0) {
                const selectedRelationship = getRandomElement(providerRelationships);
                for (const field of relationshipInputFields) {
                    if (field.type !== 'hidden' && field.offsetParent !== null) { // If visible
                        field.value = selectedRelationship;
                        dispatchEvents(field);
                        console.log(`Set relationship text input to: ${selectedRelationship}`);
                        relationshipSet = true;
                    }
                }
            }

            // Check selects as well if text input wasn't found or filled
             if (!relationshipSet) {
                const relationshipSelects = document.querySelectorAll('select[name*="relationship" i], select[id*="relationship" i], select[name*="relation" i], select[id*="relation" i], select[name*="patientrelation" i]');
                if (relationshipSelects.length > 0) {
                    const selectedRelationship = getRandomElement(providerRelationships);
                    for (const select of relationshipSelects) {
                         if (select.offsetParent !== null) { // Check if visible
                            const options = Array.from(select.options);
                            let relOption = options.find(opt => opt.text.toLowerCase() === selectedRelationship.toLowerCase() || opt.value.toLowerCase() === selectedRelationship.toLowerCase());

                            if (!relOption) { // If exact match failed, try partial match or 'Other'
                                relOption = options.find(opt => opt.text.toLowerCase().includes(selectedRelationship.toLowerCase()));
                                if (!relOption) {
                                    relOption = options.find(opt => opt.text.toLowerCase() === 'other' || opt.value.toLowerCase() === 'other');
                                }
                            }

                            if (relOption) {
                                select.value = relOption.value;
                                dispatchEvents(select);
                                console.log(`Set relationship dropdown to: ${relOption.text}`);
                                relationshipSet = true;
                            }
                         }
                    }
                }
            }
             if (!relationshipSet) {
                 console.log("Could not find a suitable relationship field to fill.");
             }


            // Generate and fill textarea content
            const textareaContents = [
                "This information is being provided as part of our standard reporting process.",
                "Please review this submission as part of the ongoing documentation protocol.",
                "The details above are submitted for your consideration and appropriate action.",
                "These are my observations regarding the matter in question.",
                "I would like to contribute this information to help improve the overall process.",
                "Providing details as requested for this report.",
                "Submitting the required information for review.",
                "Please find the relevant details enclosed in this submission.",
                "Forwarding the necessary information per requirements.",
                "Observations noted and submitted for record-keeping.",
                "Details provided for assessment and potential follow-up.",
            ];

            let textContent = getRandomElement(textareaContents);
            if (lastFormData.textContent && textContent === lastFormData.textContent) {
                const filteredContents = textareaContents.filter(c => c !== lastFormData.textContent);
                textContent = getRandomElement(filteredContents.length > 0 ? filteredContents : textareaContents);
            }
            formData.textContent = textContent;

            const textareas = document.querySelectorAll('textarea');
            for (const textarea of textareas) {
                 if (textarea.offsetParent !== null && !textarea.disabled && !textarea.readOnly) { // Check if visible and enabled
                    textarea.value = textContent;
                    dispatchEvents(textarea);
                 }
            }

            // Handle checkboxes (excluding radio buttons)
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            if (checkboxes.length > 0) {
                const visibleCheckboxes = Array.from(checkboxes).filter(cb => cb.offsetParent !== null && !cb.disabled);
                if (visibleCheckboxes.length > 0) {
                    const maxToCheck = Math.max(1, Math.ceil(visibleCheckboxes.length / 3)); // Check up to 1/3
                    const numToCheck = Math.floor(Math.random() * maxToCheck) + 1;
                    const shuffled = visibleCheckboxes.sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, numToCheck);
                    for (const checkbox of selected) {
                        if (!checkbox.checked) {
                            checkbox.click(); // Use click for checkboxes
                            dispatchEvents(checkbox); // Still dispatch events
                            console.log("Checked checkbox: " + (checkbox.name || checkbox.id || "unnamed"));
                        }
                    }
                }
            }

            // Handle required checkboxes near submit button (Terms, Agreement etc.)
            const submitButtonsForCheckbox = [
                ...document.querySelectorAll('input[type="submit"], button[type="submit"]'),
                ...Array.from(document.querySelectorAll('button')).filter(b => b.textContent?.toLowerCase().includes('submit') || b.textContent?.toLowerCase().includes('continue') || b.textContent?.toLowerCase().includes('next'))
            ].filter(btn => btn.offsetParent !== null && !btn.disabled); // Filter for visible, enabled buttons

            if (submitButtonsForCheckbox.length > 0) {
                const submitButton = submitButtonsForCheckbox[0]; // Use the first visible submit/continue button
                const submitButtonRect = submitButton.getBoundingClientRect();
                const nearbyCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).filter(checkbox => {
                    if (checkbox.offsetParent === null || checkbox.disabled) return false; // Skip hidden/disabled
                    try {
                        const checkboxRect = checkbox.getBoundingClientRect();
                        const parentLabel = checkbox.closest('label') || checkbox.parentElement;
                        const labelText = parentLabel?.textContent?.toLowerCase() || '';
                        const isRequired = checkbox.required || labelText.includes('agree') || labelText.includes('terms') || labelText.includes('accept') || labelText.includes('confirm') || labelText.includes('required') || labelText.includes('*');

                        // Check proximity and if it seems required
                        return isRequired &&
                               checkboxRect.bottom > 0 && submitButtonRect.top > 0 &&
                               checkboxRect.bottom <= submitButtonRect.top + 50 && // Allow slightly below top of button
                               (submitButtonRect.top - checkboxRect.bottom < 250) && // Max vertical distance above button
                               Math.abs(checkboxRect.left - submitButtonRect.left) < 400; // Horizontal proximity
                    } catch (e) { return false; }
                });
                for (const checkbox of nearbyCheckboxes) {
                    if (!checkbox.checked) {
                        checkbox.click(); // Use click
                        dispatchEvents(checkbox); // Still dispatch
                        console.log("Checked nearby required checkbox: " + (checkbox.name || checkbox.id || labelText.substring(0, 30) || "unnamed"));
                    }
                }
            }

            // Handle remaining required fields that might still be empty
            const requiredFields = document.querySelectorAll('[required]');
            for (const field of requiredFields) {
                 if (field.offsetParent !== null && !field.disabled && !field.readOnly) { // Check if visible and enabled
                    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
                        if (!field.value && typeof field.value === 'string') {
                            console.warn(`Required field is empty: ${field.name || field.id}. Attempting generic fill.`);
                            let filled = false;
                            if (field.type === 'email') { field.value = "required@example.com"; filled = true; }
                            else if (field.type === 'tel') { field.value = "(555)-555-5555"; filled = true; }
                            else if (field.type === 'url') { field.value = "https://example.com"; filled = true; }
                            else if (field.type === 'number') { field.value = "0"; filled = true; }
                            else if (field.type === 'date') { field.value = new Date().toISOString().split('T')[0]; filled = true; }
                             // Generic text/textarea fill last
                            else if (field.type === 'text' || field.type === 'textarea' || field.type === 'password') { field.value = "N/A"; filled = true; }

                            if(filled) dispatchEvents(field);
                        }
                    } else if (field.tagName === 'SELECT') {
                        if (field.value === '' || field.selectedIndex <= 0) { // Check if default/empty option selected
                             console.warn(`Required select field is empty: ${field.name || field.id}. Attempting to select first valid option.`);
                             if (field.options.length > 1) {
                                 field.selectedIndex = 1; // Select the first non-placeholder option
                                 dispatchEvents(field);
                             }
                        }
                    }
                 }
            }

            lastFormData = formData; // Store data used for this fill

            // Check validation errors after a brief pause
            await new Promise(resolve => setTimeout(resolve, 750));
            updateStatus("Checking validation...");
            const errorMessages = document.querySelectorAll('.error-message, .invalid-feedback, [class*="error" i], [class*="invalid" i]');
            const invalidFields = document.querySelectorAll('.is-invalid, [aria-invalid="true"], input:invalid, select:invalid, textarea:invalid');

            if (errorMessages.length > 0 || invalidFields.length > 0) {
                console.log(`Validation issues detected (${errorMessages.length} messages, ${invalidFields.length} fields). Attempting fixes...`);
                updateStatus("Fixing validation...");
                 for (const field of invalidFields) {
                     if (field.offsetParent === null || field.disabled || field.readOnly) continue; // Skip hidden/disabled

                    if (field.type === 'tel' || field.name?.toLowerCase().includes('phone') || field.placeholder?.toLowerCase().includes('phone')) {
                        console.log("Trying to fix invalid phone number for field:", field.name || field.id);
                        const section = getFieldSection(field);
                        let basePhone;
                        switch (section) {
                             case 'employer': basePhone = employerInfo.phone; break;
                             case 'provider': basePhone = healthcareInfo.phone; break;
                             case 'business': basePhone = businessInfo.phone; break;
                             case 'personal': basePhone = personalInfo.phone; break;
                        }
                        const altFormats = generateAlternatePhoneFormats(basePhone);
                        let fixed = false;
                        for (const format of altFormats) {
                            console.log("Trying phone format:", format);
                            field.value = ''; dispatchEvents(field); await new Promise(resolve => setTimeout(resolve, 50));
                            field.value = format; dispatchEvents(field); await new Promise(resolve => setTimeout(resolve, 250));
                            // Re-check validity
                            const stillInvalid = field.matches(':invalid') || field.classList.contains('is-invalid') || field.getAttribute('aria-invalid') === 'true';
                            if (!stillInvalid) { console.log("Fixed phone number format to:", format); fixed = true; break; }
                        }
                        if (!fixed) { // Last resort: simple digits
                            const simpleDigits = basePhone.replace(/\D/g, '');
                            console.log("Trying simple digit phone format:", simpleDigits);
                            field.value = ''; dispatchEvents(field); await new Promise(resolve => setTimeout(resolve, 50));
                            field.value = simpleDigits; dispatchEvents(field);
                        }
                    } else if (field.type === 'email' || field.name?.toLowerCase().includes('email') || field.placeholder?.toLowerCase().includes('email')) {                         // Re-check validity                         const stillInvalid = field.matches(':invalid') || field.classList.contains('is-invalid') || field.getAttribute('aria-invalid') === 'true';
                         if (stillInvalid) {
                            console.log("Trying to fix invalid email for field:", field.name || field.id);

                            // First try to use the originally assigned email domain rather than example.com
                            const section = getFieldSection(field);
                            let originalEmail;

                            switch (section) {
                                case 'employer': originalEmail = employerInfo.email; break;
                                case 'provider': originalEmail = healthcareInfo.email; break;
                                case 'business': originalEmail = businessInfo.email; break;
                                case 'personal': originalEmail = personalInfo.email; break;
                            }

                            // Extract domain from original email
                            const domainMatch = originalEmail.match(/@([^@]+)$/);
                            const domain = domainMatch ? domainMatch[1] : 'gmail.com'; // Default to gmail if no match

                            // Create a new simple email with the original domain
                            const fixNum = Math.floor(Math.random() * 10000);
                            const newEmail = "fix" + fixNum + "@" + domain;
                            field.value = newEmail; dispatchEvents(field);                              // Check if still invalid after our first attempt
                            const stillInvalidAfterFix = field.matches(':invalid') || field.classList.contains('is-invalid') || field.getAttribute('aria-invalid') === 'true';
                            if (stillInvalidAfterFix) {
                                // Fall back to example.com only if absolutely necessary
                                const fallbackEmail = "fix" + fixNum + "@example.com";
                                field.value = fallbackEmail; dispatchEvents(field);
                                console.log("Field still invalid. Using ultimate fallback to example.com domain");
                            }
                         }
                    } else if (field.required && !field.value) {
                         // Handle other required fields missed earlier
                         console.log("Trying to fix other invalid/empty required field:", field.name || field.id);
                         if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') { field.value = "N/A (fix)"; dispatchEvents(field); }
                         else if (field.tagName === 'SELECT' && field.options.length > 1) { field.selectedIndex = 1; dispatchEvents(field); }
                    }
                 }
                 await new Promise(resolve => setTimeout(resolve, 300)); // Wait after fixes
            }

            console.log("Form filling process complete.");

            // Check captcha
            const captchaResult = await handleCaptcha();
            if (!captchaResult) {                console.log("Captcha detected - user must solve and submit manually.");
                loopCount++; GM_setValue('loopCount', loopCount);
                updateStatus("Captcha - Manual Submit"); updateCount();
                return;
            }

            // Final state (if no captcha)
            loopCount++; GM_setValue('loopCount', loopCount);
            updateStatus("Filled - Review & Submit"); updateCount();
            console.log("Form filled. Please review carefully and submit manually."); // Log instead of notification
            setTimeout(scrollToSubmitButton, 300); // Reduced delay for scrolling to submit

        } catch (error) {            console.error("Error in form filling script:", error);
            updateStatus("Error Occurred");
        }
    }     // Auto-scroll to submit or CAPTCHA
     function scrollToSubmitButton() {
        // Try CAPTCHA first
        const captchaElement = document.querySelector('div[data-drupal-selector="edit-captcha"], div.captcha, input#edit-submit');

        // Scroll if visible
        if (captchaElement && captchaElement.offsetParent !== null && captchaElement.offsetHeight > 0) {
            console.log("Scrolling to CAPTCHA element");
            captchaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Target the specific submit button from HTML provided
        const specificSubmitButton = document.querySelector('input.webform-button--submit[data-drupal-selector="edit-submit"], input#edit-submit');
        if (specificSubmitButton && specificSubmitButton.offsetParent !== null) {
            console.log("Scrolling to specific submit button");
            specificSubmitButton.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Highlight the button briefly
            const originalOutline = specificSubmitButton.style.outline;
            specificSubmitButton.style.outline = '3px solid #5cb85c';
            setTimeout(() => { specificSubmitButton.style.outline = originalOutline; }, 2500);
            return;
        }

        // If specific button not found, fall back to any submit buttons
        const submitButtons = [
            ...document.querySelectorAll('input[type="submit"], button[type="submit"]'),
            ...Array.from(document.querySelectorAll('button')).filter(b =>
                (b.textContent?.toLowerCase().includes('submit') || b.textContent?.toLowerCase().includes('continue') || b.textContent?.toLowerCase().includes('next')) && !b.disabled)
        ];
        if (submitButtons.length > 0) {
            let targetButton = null;
             for(const btn of submitButtons) {
                 const style = window.getComputedStyle(btn);
                 if (style.display !== 'none' && style.visibility !== 'hidden' && btn.offsetHeight > 0 && btn.offsetWidth > 0) {
                     targetButton = btn; break; // Find first visible, enabled submit-like button
                 }
             }
            if (targetButton) {
                console.log("Scrolling to submit button:", targetButton);
                targetButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Highlight the button briefly
                const originalOutline = targetButton.style.outline;
                targetButton.style.outline = '3px solid #5cb85c';
                setTimeout(() => { targetButton.style.outline = originalOutline; }, 2500);
            } else { console.log("Submit button found but not visible/enabled for scrolling."); }
        } else { console.log("Submit button not found for scrolling."); }
    }    // Create and add UI
    function createUI() {
        // Main UI container
        const ui = document.createElement('div');
        ui.id = 'form-automation-ui';
        ui.style.position = 'fixed';

        // Retrieve saved position using multiple storage mechanisms
        let savedTop = null;
        let savedLeft = null;

        // Try sessionStorage first (more reliable for page refreshes)
        try {
            savedTop = sessionStorage.getItem('transshield_ui_top');
            savedLeft = sessionStorage.getItem('transshield_ui_left');
            if (savedTop && savedLeft) {
                console.log("Using UI position from sessionStorage for UI creation");
            }
        } catch(e) {
            console.log("Couldn't access sessionStorage during UI creation");
        }

        // Fall back to GM storage if needed
        if (!savedTop || !savedLeft) {
            savedTop = GM_getValue('ui_position_top');
            savedLeft = GM_getValue('ui_position_left');
        }

        // Apply saved position or use defaults
        if (savedTop && savedLeft) {
            ui.style.top = savedTop;
            ui.style.left = savedLeft;
            ui.style.right = 'auto'; // Clear right positioning when we have saved left

            // Ensure both storage mechanisms are in sync
            GM_setValue('ui_position_top', savedTop);
            GM_setValue('ui_position_left', savedLeft);

            try {
                sessionStorage.setItem('transshield_ui_top', savedTop);
                sessionStorage.setItem('transshield_ui_left', savedLeft);
            } catch(e) {
                // Continue silently if sessionStorage fails
            }
        } else {
            ui.style.top = '15px';
            ui.style.right = '15px';
        }

        ui.style.zIndex = '10000'; // Ensure high z-index
        ui.style.backgroundColor = 'rgb(40, 40, 40)';
        ui.style.padding = '15px';
        ui.style.borderRadius = '8px';
        ui.style.color = '#f0f0f0';
        ui.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
        ui.style.minWidth = '240px';
        ui.style.maxWidth = '300px'; // Max width
        ui.style.boxShadow = '0 2px 15px rgba(0,0,0,0.6)';
        ui.style.fontSize = '14px'; // Base font size

        // --- Styling for Label/Value pairs ---
        const infoItemStyle = `
            border-bottom: 1px solid #444;
            padding-bottom: 8px;
            margin-bottom: 10px;
            line-height: 1.5; /* Improve readability */        `;        const labelStyle = `
            font-weight: bold; /* Use standard bold */
            color: #FFFFFF; /* Changed to bold white color as requested */
            display: inline-block; /* Prevent wrapping issue */
            margin-right: 5px;
        `;
        const valueStyle = `
            font-weight: normal; /* Ensure value is not bold */
            color: #f0f0f0; /* Lighter color for value */
            word-break: break-all; /* Prevent long values overflowing */
            display: inline; /* Keep on same line as label */
        `;

        // --- Add "Protect Trans Youth!" statement --- [MODIFIED]
        const protectStatementContainer = document.createElement('div');
        protectStatementContainer.style.cssText = infoItemStyle;
        protectStatementContainer.style.textAlign = 'center'; // Center the text
        protectStatementContainer.style.borderBottom = 'none'; // Remove border if it's the very top item
        protectStatementContainer.style.marginBottom = '12px'; // Add some space below it
        protectStatementContainer.style.padding = '5px 0'; // Add some vertical padding
        const protectStatement = document.createElement('span');        protectStatement.textContent = '🏳️‍⚧️🛡️ TransShield 🛡️🏳️‍⚧️'; // Updated text and emojis
        protectStatement.style.fontWeight = 'bold'; // Make the statement bold
        protectStatement.style.color = '#FFFFFF'; // Brighter white color
        protectStatement.style.fontSize = '18px'; // Larger font size for more prominence
        protectStatement.style.textShadow = '0 0 3px rgba(91, 192, 222, 0.7)'; // Add text shadow for more pop
        protectStatementContainer.appendChild(protectStatement);
        ui.appendChild(protectStatementContainer); // Append first        // Add VPN reminder (and Drag Handle) - [MODIFIED EMOJI & COLOR]
        const vpnReminder = document.createElement('div');        vpnReminder.textContent = '🔒 VPN ACTIVE? 🔒'; // Changed to lock emojis
        vpnReminder.style.fontWeight = 'bold';
        vpnReminder.style.color = '#f1c40f'; // Changed to yellow to match lock emoji
        vpnReminder.style.backgroundColor = '#444'; // Darker background for contrast
        vpnReminder.style.padding = '5px 0';
        vpnReminder.style.borderRadius = '4px';
        vpnReminder.style.marginBottom = '15px'; // More space below
        vpnReminder.style.textAlign = 'center';
        vpnReminder.style.fontSize = '15px'; // Slightly larger reminder
        vpnReminder.style.cursor = 'move'; // Make this the drag handle
        ui.appendChild(vpnReminder); // Append second

        // Add user login display
        const loginContainer = document.createElement('div');
        loginContainer.style.cssText = infoItemStyle;
        const loginLabel = document.createElement('span');
        loginLabel.textContent = 'Created By:';
        loginLabel.style.cssText = labelStyle;        const loginValue = document.createElement('span');
        loginValue.textContent = '💖 ' + userLogin + ' 💖'; // Added pink hearts on each side
        loginValue.style.cssText = valueStyle;
        loginValue.style.color = '#FF69B4'; // Nice pink color for KirbySoftware
        loginContainer.appendChild(loginLabel); loginContainer.appendChild(loginValue);
        ui.appendChild(loginContainer);

        // Add status indicator (Label + Value)
        const statusContainer = document.createElement('div');
        statusContainer.id = 'automation-status';
        statusContainer.style.cssText = infoItemStyle;
        const statusLabel = document.createElement('span');
        statusLabel.textContent = 'Status:';
        statusLabel.style.cssText = labelStyle;
        const statusValue = document.createElement('span');
        statusValue.id = 'automation-status-value';
        statusValue.textContent = 'Ready';
        statusValue.style.cssText = valueStyle;
        statusValue.style.color = '#ddd';
        statusContainer.appendChild(statusLabel); statusContainer.appendChild(statusValue);
        ui.appendChild(statusContainer);

        // Add count display (Label + Value)
        const countContainer = document.createElement('div');
        countContainer.id = 'automation-count';
        countContainer.style.cssText = infoItemStyle;
        countContainer.style.marginBottom = '18px';
        const countLabel = document.createElement('span');
        countLabel.textContent = 'Fills:';
        countLabel.style.cssText = labelStyle;
        const countValue = document.createElement('span');
        countValue.id = 'automation-count-value';
        countValue.textContent = loopCount;
        countValue.style.cssText = valueStyle;
        countValue.style.fontSize = '15px';
        countContainer.appendChild(countLabel); countContainer.appendChild(countValue);
        ui.appendChild(countContainer);        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'grid'; // Use grid for better control
        buttonContainer.style.gridTemplateColumns = '2fr 1fr 1.3fr'; // More space for Captcha Config, balanced for bottom row
        buttonContainer.style.gridTemplateRows = '1fr 1fr'; // Two rows for buttons
        buttonContainer.style.gap = '8px';
        buttonContainer.style.marginTop = '5px'; // Add slight top margin to separate from count

        // --- Button Styling ---
        const buttonBaseStyle = `
            padding: 9px 0;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            text-align: center;
            transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
            line-height: 1.2;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            white-space: nowrap; /* Prevent text wrapping */
            overflow: hidden;
            text-overflow: ellipsis;
        `;        // Fill Form button
        const fillButton = document.createElement('button');
        fillButton.textContent = 'Fill Form';
        fillButton.title = 'Fill the form with generated data';
        fillButton.style.cssText = buttonBaseStyle;        fillButton.style.backgroundColor = '#5cb85c'; // Green
        fillButton.style.gridColumn = '1 / 2'; // First column
        fillButton.style.gridRow = '2 / 3'; // Second row
        fillButton.onmouseover = () => { fillButton.style.backgroundColor = '#4cae4c'; fillButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.4)'; };
        fillButton.onmouseout = () => { fillButton.style.backgroundColor = '#5cb85c'; fillButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)'; };
        fillButton.onmousedown = () => fillButton.style.transform = 'scale(0.98)';
        fillButton.onmouseup = () => fillButton.style.transform = 'scale(1)';
        fillButton.onclick = fillForm;
        buttonContainer.appendChild(fillButton);

        // Go to Target URL Button (Back/Refresh) - PURPLE
        const goToTargetButton = document.createElement('button');
        goToTargetButton.textContent = '⬅️🔄⬇️'; // Updated emojis in exact order requested
        goToTargetButton.title = 'Go to Start Page & Scroll';
        goToTargetButton.style.cssText = buttonBaseStyle;        goToTargetButton.style.backgroundColor = '#6f42c1'; // Purple base color
        goToTargetButton.style.gridColumn = '2 / 3'; // Second column
        goToTargetButton.style.gridRow = '2 / 3'; // Second row
        goToTargetButton.onmouseover = () => { goToTargetButton.style.backgroundColor = '#5a32a3'; goToTargetButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.4)'; }; // Darker purple on hover
        goToTargetButton.onmouseout = () => { goToTargetButton.style.backgroundColor = '#6f42c1'; goToTargetButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)'; }; // Restore base purple
        goToTargetButton.onmousedown = () => goToTargetButton.style.transform = 'scale(0.98)';
        goToTargetButton.onmouseup = () => goToTargetButton.style.transform = 'scale(1)';
        goToTargetButton.onclick = goToTargetPage;
        buttonContainer.appendChild(goToTargetButton);

        // Reset counter button (Red)
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.title = 'Reset Fill Count';
        resetButton.style.cssText = buttonBaseStyle;        resetButton.style.backgroundColor = '#d9534f'; // Red
        resetButton.style.gridColumn = '3 / 4'; // Third column
        resetButton.style.gridRow = '2 / 3'; // Second row
        resetButton.onmouseover = () => { resetButton.style.backgroundColor = '#c9302c'; resetButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.4)'; };
        resetButton.onmouseout = () => { resetButton.style.backgroundColor = '#d9534f'; resetButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)'; };
        resetButton.onmousedown = () => resetButton.style.transform = 'scale(0.98)';
        resetButton.onmouseup = () => resetButton.style.transform = 'scale(1)';
        resetButton.onclick = resetCounter;        buttonContainer.appendChild(resetButton);        // Captcha Config button - Blue (left half of second row)
        const captchaConfigButton = document.createElement('button');
        captchaConfigButton.textContent = 'Captcha Config';
        captchaConfigButton.title = 'Configure CAPTCHA API settings';
        captchaConfigButton.style.cssText = buttonBaseStyle;        captchaConfigButton.style.backgroundColor = '#3498db'; // Blue        captchaConfigButton.style.gridColumn = '1 / 2'; // First column - bigger space for text
        captchaConfigButton.style.gridRow = '1 / 2'; // First row
        captchaConfigButton.style.width = '100%'; // Full width
        captchaConfigButton.onmouseover = () => { captchaConfigButton.style.backgroundColor = '#2980b9'; captchaConfigButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.4)'; };
        captchaConfigButton.onmouseout = () => { captchaConfigButton.style.backgroundColor = '#3498db'; captchaConfigButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)'; };
        captchaConfigButton.onmousedown = () => captchaConfigButton.style.transform = 'scale(0.98)';        captchaConfigButton.onmouseup = () => captchaConfigButton.style.transform = 'scale(1)';        captchaConfigButton.onclick = showCaptchaSettings;
        buttonContainer.appendChild(captchaConfigButton);        // Automate button - Purple (right half of second row)
        const automateButton = document.createElement('button');
        automateButton.textContent = 'Automate';
        automateButton.title = 'Start automated form filling with CAPTCHA solving (requires API key)';
        automateButton.style.cssText = buttonBaseStyle;        automateButton.style.backgroundColor = '#9b59b6'; // Purple
        automateButton.style.gridColumn = '2 / 4'; // Right side - spans last two columns
        automateButton.style.gridRow = '1 / 2'; // First row
        automateButton.style.width = '100%'; // Full width
        automateButton.onmouseover = () => { automateButton.style.backgroundColor = '#8e44ad'; automateButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.4)'; };
        automateButton.onmouseout = () => { automateButton.style.backgroundColor = '#9b59b6'; automateButton.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)'; };
        automateButton.onmousedown = () => automateButton.style.transform = 'scale(0.98)';
        automateButton.onmouseup = () => automateButton.style.transform = 'scale(1)';
        automateButton.onclick = automateForm;
        buttonContainer.appendChild(automateButton);

        ui.appendChild(buttonContainer);

        // Make UI draggable via VPN bar
        makeDraggable(ui, vpnReminder);

        document.body.appendChild(ui);
        console.log("Form Filler UI created.");
    }    // Navigate back to form page
    function goToTargetPage() {
        console.log(`Navigating to ${targetUrl}...`);
        updateStatus("Navigating...");
        try {
            // Set flag for auto-scroll after navigation
            GM_setValue('scrollToSubmitAfterNav', true);

            // Make sure to preserve UI position during navigation
            const uiElement = document.getElementById('form-automation-ui');
            if (uiElement) {
                // Get computed style to ensure we have actual values
                const computedStyle = window.getComputedStyle(uiElement);

                // Get current position from inline styles first (most accurate if set)
                let currentTop = uiElement.style.top;
                let currentLeft = uiElement.style.left;

                // If inline styles aren't available, use computed values
                if (!currentTop || currentTop === '') currentTop = computedStyle.top;
                if (!currentLeft || currentLeft === '') currentLeft = computedStyle.left;

                if (currentTop && currentLeft) {
                    console.log(`Preserving UI position during navigation: top=${currentTop}, left=${currentLeft}`);

                    // Save to GM storage
                    GM_setValue('ui_position_top', currentTop);
                    GM_setValue('ui_position_left', currentLeft);

                    // Also save to sessionStorage for better persistence across page loads
                    try {
                        sessionStorage.setItem('transshield_ui_top', currentTop);
                        sessionStorage.setItem('transshield_ui_left', currentLeft);
                    } catch(e) {
                        console.log("Failed to save to sessionStorage:", e);
                    }
                }
            }

            window.location.href = targetUrl;
        } catch (error) {
             console.error("Error navigating to target URL:", error);
             updateStatus("Navigation Error");
        }
    }

    // Make an element draggable
    function makeDraggable(element, handle) { // Accept specific handle
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const dragHandle = handle || element; // Use handle if provided, else the element itself

        dragHandle.onmousedown = dragMouseDown;
        // Ensure the handle has the move cursor if it's not the element itself
        if (handle) dragHandle.style.cursor = 'move';

        function dragMouseDown(e) {
            // Prevent drag on buttons or other interactive elements within the handle
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA' || e.target.closest('button, input, select, textarea')) return;

            // Check if the click is specifically on the drag handle
            if (handle && e.target !== handle && !handle.contains(e.target)) return;

            e = e || window.event;
            e.preventDefault(); // Prevent text selection during drag
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
            document.body.style.userSelect = 'none'; // Prevent selection globally during drag
        }        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX; // Calculate the new cursor position
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // Set the element's new position
            let newTop = element.offsetTop - pos2;
            let newLeft = element.offsetLeft - pos1;

            // Keep within viewport bounds (optional, but good practice)
            const rect = element.getBoundingClientRect();
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - rect.height)); // Use innerHeight/Width for viewport
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - rect.width));

            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
            element.style.right = 'auto'; // Override right positioning if set
            element.style.bottom = 'auto'; // Override bottom positioning if set

            // Save position during dragging
            GM_setValue('ui_position_top', element.style.top);
            GM_setValue('ui_position_left', element.style.left);

            // Save to sessionStorage as well for better persistence
            try {
                sessionStorage.setItem('transshield_ui_top', element.style.top);
                sessionStorage.setItem('transshield_ui_left', element.style.left);
            } catch(e) {
                // Silent fail - just continue without sessionStorage if unavailable
            }
        }        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
            document.body.style.userSelect = ''; // Restore selection

            // Save the UI position to GM storage
            GM_setValue('ui_position_top', element.style.top);
            GM_setValue('ui_position_left', element.style.left);

            // Save to sessionStorage as well for persistence across page reloads
            try {
                sessionStorage.setItem('transshield_ui_top', element.style.top);
                sessionStorage.setItem('transshield_ui_left', element.style.left);
            } catch(e) {
                console.log("Failed to save position to sessionStorage:", e);
            }

            console.log(`UI position saved: top=${element.style.top}, left=${element.style.left}`);
        }
    }    // Update status display (targets the value span)
    function updateStatus(customStatus) {
        const statusValueEl = document.getElementById('automation-status-value');
        if (statusValueEl) {
            statusValueEl.textContent = customStatus || "Ready";
            // Update color based on status (value color, not label)
            if (!customStatus || customStatus === "Ready") {
                statusValueEl.style.color = '#5cc6ff'; // Bright blue for Ready

            } else if (customStatus.toLowerCase().includes('error')) {
                statusValueEl.style.color = '#ff5252'; // Vibrant red for errors

            } else if (customStatus.toLowerCase().includes('captcha')) {
                statusValueEl.style.color = '#ff9d3f'; // Bright orange for captcha - needs attention

            } else if (customStatus.toLowerCase().includes('manual submit')) {
                statusValueEl.style.color = '#ff6b6b'; // Red-orange for manual submission required

            } else if (customStatus.toLowerCase().includes('warning') || customStatus.toLowerCase().includes('validation')) {
                statusValueEl.style.color = '#ffd23f'; // Bright yellow for warnings/validation issues

            } else if (customStatus.toLowerCase().includes('filled') || customStatus.toLowerCase().includes('success')) {
                statusValueEl.style.color = '#4ade80'; // Bright green for success/filled states

            } else if (customStatus.toLowerCase().includes('filling')) {
                statusValueEl.style.color = '#38bdf8'; // Light blue for filling action

            } else if (customStatus.toLowerCase().includes('checking')) {
                statusValueEl.style.color = '#a78bfa'; // Purple for checking/verification states

            } else if (customStatus.toLowerCase().includes('generating')) {
                statusValueEl.style.color = '#2dd4bf'; // Teal for generating data

            } else if (customStatus.toLowerCase().includes('navigating')) {
                statusValueEl.style.color = '#f472b6'; // Pink for navigation states

            } else {
                statusValueEl.style.color = '#ddd'; // Default light gray for unspecified states
            }
        }
    }

    // Update count display (targets the value span)
    function updateCount() {
         const countValueEl = document.getElementById('automation-count-value');
         if (countValueEl) {
            countValueEl.textContent = loopCount;
         }
    }

    // Reset counter function
    function resetCounter() {
        if (confirm("Are you sure you want to reset the fill count to zero?")) {
            loopCount = 0;
            GM_setValue('loopCount', 0);
            updateStatus("Ready");
            updateCount();
            console.log("Counter reset to zero"); // Log instead of notification
        }
    }    // Convert state name to abbreviation
    function getStateAbbreviation(stateName) {
        const states = {
            'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'District of Columbia': 'DC', 'Florida': 'FL', 'Georgia': 'GA',
            'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA',
            'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
            'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN',
            'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
        };
        return states[stateName] || null;
    }
    // Initialize when page is loaded and ready
    function initialize() {
        // Check if the UI already exists
        if (document.getElementById('form-automation-ui')) {
            console.log("Form filler UI already exists. Skipping initialization.");

            // Even if UI exists, ensure its position is set from stored values
            const uiElement = document.getElementById('form-automation-ui');

            // Try to get position from sessionStorage first
            let savedTop = null;
            let savedLeft = null;

            try {
                savedTop = sessionStorage.getItem('transshield_ui_top');
                savedLeft = sessionStorage.getItem('transshield_ui_left');
                if (savedTop && savedLeft) {
                    console.log("Retrieved UI position from sessionStorage");
                }
            } catch(e) {
                console.log("Couldn't access sessionStorage:", e);
            }

            // If not found in sessionStorage, fall back to GM values
            if (!savedTop || !savedLeft) {
                savedTop = GM_getValue('ui_position_top');
                savedLeft = GM_getValue('ui_position_left');
            }

            if (uiElement && savedTop && savedLeft) {
               console.log(`Restoring saved UI position: top=${savedTop}, left=${savedLeft}`);
               uiElement.style.top = savedTop;
               uiElement.style.left = savedLeft;
               uiElement.style.right = 'auto'; // Clear right positioning
               uiElement.style.bottom = 'auto'; // Clear bottom positioning too

               // Make sure we sync to both storage systems
               GM_setValue('ui_position_top', savedTop);
               GM_setValue('ui_position_left', savedLeft);

               try {
                   sessionStorage.setItem('transshield_ui_top', savedTop);
                   sessionStorage.setItem('transshield_ui_left', savedLeft);
               } catch(e) {
                   console.log("Couldn't update sessionStorage:", e);
               }
            }
            return;
        }
        console.log("Form filler tool initializing...");
        createUI();
        updateStatus("Ready"); // Set initial status
        updateCount(); // Set initial count

         // Check if we need to scroll to the submit button after navigation
         if (GM_getValue('scrollToSubmitAfterNav', false)) {
            // Use a longer delay to ensure page is fully loaded before scrolling
            setTimeout(() => {
                console.log("Attempting to scroll to CAPTCHA/submit area after navigation");
                scrollToSubmitButton(); // Try to find CAPTCHA or submit button
                GM_setValue('scrollToSubmitAfterNav', false); // Clear the flag

                // In case the first attempt fails because elements are still loading, try once more
                setTimeout(() => {
                    if (document.querySelector('div[data-drupal-selector="edit-captcha"], div.captcha, input#edit-submit')) {
                        console.log("Second scroll attempt - elements now found");
                        scrollToSubmitButton();
                    }
                }, 500); // Try again after 0.5s for faster response

            }, 800); // Reduced delay for faster form completion
        }
    }    // Page initialization
    let initialized = false;
    const initDelay = 500;

    function attemptInitialization() {
        if (initialized) return;
        // Wait for DOM content
        if (document.body && (document.body.children.length > 0 || document.querySelector('form'))) {
            console.log("Attempting initialization...");
            initialize();
            initialized = true;
            if (observer) observer.disconnect(); // Stop observing once initialized
        } else {
             console.log("DOM not ready for initialization yet...");
        }
    }

    // Use reliable events
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log("DOMContentLoaded event fired.");
            setTimeout(attemptInitialization, initDelay);
        });
    } else { // 'interactive' or 'complete'
        console.log(`Document readyState is ${document.readyState}. Initializing soon.`);
        setTimeout(attemptInitialization, initDelay);
    }

    // Fallback observer for dynamically loaded forms if initial attempts fail
    const observer = new MutationObserver((mutationsList, obs) => {
        if (initialized) {
            obs.disconnect();
            return;
        }
        // Look for form elements or specific IDs/classes that indicate the form is likely ready
        if (document.querySelector('form') || document.querySelector('[id*="form"]') || document.querySelector('[class*="form"]')) {
            console.log("Form element detected by MutationObserver.");
            // Wait a bit longer after detection to ensure scripts associated with the form are loaded
            setTimeout(() => {
                if (!initialized) {
                    attemptInitialization();
                } else {
                     obs.disconnect(); // Disconnect if initialized by another path in the meantime
                }
            }, initDelay + 300); // Extra delay for observer detection
        }
    });

    // Start observing the body for changes if not already initialized
    if (!initialized) {
         // Ensure body exists before observing
         if (document.body) {
             observer.observe(document.body, { childList: true, subtree: true });
         } else {
             // If body doesn't exist yet, wait for DOMContentLoaded to add observer
             document.addEventListener('DOMContentLoaded', () => {
                 if (!initialized && document.body) { // Check initialized again
                     observer.observe(document.body, { childList: true, subtree: true });
                 }
             });
         }
    }

    // --- Function to show CAPTCHA settings modal ---
    function showCaptchaSettings() {
        console.log("TransShield: Opening Captcha API Configuration");

        // Remove any existing modal
        const existingModal = document.getElementById('transshield-captcha-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'transshield-captcha-modal';
        modalOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
            width: 350px;
            max-width: 90%;
            position: relative;
        `;

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #333;
            padding: 0 8px;
        `;
        closeButton.onclick = () => modalOverlay.remove();

        // Create header
        const header = document.createElement('h2');
        header.textContent = 'Captcha API Configuration';
        header.style.cssText = `
            margin-top: 0;
            margin-bottom: 20px;
            color: #333;
            font-size: 18px;
        `;

        // Create provider selection
        const providerLabel = document.createElement('div');
        providerLabel.textContent = 'CAPTCHA Service Provider:';
        providerLabel.style.cssText = `
            margin-bottom: 8px;
            font-weight: bold;
        `;

        const providerSelect = document.createElement('select');
        providerSelect.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-bottom: 15px;
            border-radius: 4px;
            border: 1px solid #ccc;
        `;

        // Add provider options
        const providers = [
            { value: '2captcha', text: '2Captcha.com' },
            { value: 'nopecha', text: 'NoCaptcha.com' }
        ];

        providers.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider.value;
            option.textContent = provider.text;
            if (provider.value === captchaProvider) {
                option.selected = true;
            }
            providerSelect.appendChild(option);
        });

        // Create API Key input
        const apiKeyLabel = document.createElement('div');
        apiKeyLabel.textContent = 'API Key:';
        apiKeyLabel.style.cssText = `
            margin-bottom: 8px;
            font-weight: bold;
        `;

        const apiKeyInput = document.createElement('input');
        apiKeyInput.type = 'text';
        apiKeyInput.placeholder = 'Enter your API key';
        apiKeyInput.value = captchaApiKey;
        apiKeyInput.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-bottom: 20px;
            border-radius: 4px;
            border: 1px solid #ccc;
            box-sizing: border-box;
        `;

        // Create auto mode checkbox
        const autoModeContainer = document.createElement('div');
        autoModeContainer.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        `;

        const autoModeCheckbox = document.createElement('input');
        autoModeCheckbox.type = 'checkbox';
        autoModeCheckbox.id = 'transshield-captcha-auto-mode';
        autoModeCheckbox.checked = captchaAutoMode;
        autoModeCheckbox.style.cssText = `
            margin-right: 10px;
            width: 18px;
            height: 18px;
        `;

        const autoModeLabel = document.createElement('label');
        autoModeLabel.textContent = 'Auto-solve CAPTCHA when available';
        autoModeLabel.htmlFor = 'transshield-captcha-auto-mode';
        autoModeLabel.style.cssText = `
            font-weight: bold;
        `;

        autoModeContainer.appendChild(autoModeCheckbox);
        autoModeContainer.appendChild(autoModeLabel);

        // Create save button
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save Settings';
        saveButton.style.cssText = `
            background-color: #27ae60;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            width: 100%;
        `;

        saveButton.onmouseover = () => saveButton.style.backgroundColor = '#219955';
        saveButton.onmouseout = () => saveButton.style.backgroundColor = '#27ae60';

        saveButton.onclick = () => {
            captchaApiKey = apiKeyInput.value.trim();
            captchaProvider = providerSelect.value;
            captchaAutoMode = autoModeCheckbox.checked;

            // Save to GM storage
            GM_setValue('captchaApiKey', captchaApiKey);
            GM_setValue('captchaProvider', captchaProvider);
            GM_setValue('captchaAutoMode', captchaAutoMode);

            // Show success message and close modal
            const status = document.querySelector('#automation-status-value');
            if (status) {
                if (captchaApiKey) {
                    status.textContent = 'Captcha API configuration saved!';
                    setTimeout(() => status.textContent = 'Ready', 2000);
                } else {
                    status.textContent = 'API key cleared';
                    setTimeout(() => status.textContent = 'Ready', 2000);
                }
            }

            modalOverlay.remove();
        };

        // Add everything to modal
        modalContent.appendChild(closeButton);
        modalContent.appendChild(header);
        modalContent.appendChild(providerLabel);
        modalContent.appendChild(providerSelect);
        modalContent.appendChild(apiKeyLabel);
        modalContent.appendChild(apiKeyInput);
        modalContent.appendChild(autoModeContainer);
        modalContent.appendChild(saveButton);

        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);    }

    // --- Automation Functions ---

    // Function to automate form with CAPTCHA solving
    function automateForm() {
        if (isAutomating) {
            // Stop automation
            console.log("TransShield: Stopping automation");
            isAutomating = false;
            if (automationInterval) {
                clearInterval(automationInterval);
                automationInterval = null;
            }
            updateStatus('Automation stopped');

            // Update button text and color to show it can start again
            const automateButton = document.querySelector('#form-automation-ui button[title*="automated"]');
            if (automateButton) {
                automateButton.textContent = 'Automate';
                automateButton.style.backgroundColor = '#9b59b6'; // Purple
            }
            return;
        }

        // Start automation
        console.log("TransShield: Starting automated form submissions");

        if (!captchaApiKey) {
            // If no API key is set, show the Captcha API configuration modal
            updateStatus('No API key set');
            showCaptchaSettings();
            return;
        }

        isAutomating = true;
        updateStatus('Automation running...');

        // Update button text and color to show it can stop
        const automateButton = document.querySelector('#form-automation-ui button[title*="automated"]');
        if (automateButton) {
            automateButton.textContent = 'Stop Auto';
            automateButton.style.backgroundColor = '#e74c3c'; // Red color
        }

        // Function to perform a single automation cycle
        function performAutomationCycle() {
            if (!isAutomating) return; // Safety check

            console.log("TransShield: Performing automation cycle");

            // Fill the form first
            fillForm();

            // Then attempt to solve CAPTCHA and submit
            setTimeout(() => {
                if (!isAutomating) return; // Check again after delay

                updateStatus('Solving CAPTCHA...');
                solveCaptcha()
                    .then(() => {
                        if (!isAutomating) return;
                        updateStatus('CAPTCHA solved!');
                        // Submit form after solving CAPTCHA
                        submitForm();

                        // Wait for page to process, then continue if still automating
                        setTimeout(() => {
                            if (isAutomating) {
                                updateStatus('Automation running...');
                                // Check if we're still on the form page, if so continue
                                const submitButton = document.querySelector('input[type="submit"], button[type="submit"]');
                                if (submitButton) {
                                    performAutomationCycle();
                                } else {
                                    // Form might have been submitted, wait longer before next cycle
                                    setTimeout(performAutomationCycle, 3000);
                                }
                            }
                        }, 2000);
                    })
                    .catch(error => {
                        if (!isAutomating) return;
                        console.error("TransShield CAPTCHA Error:", error);
                        updateStatus('CAPTCHA failed: ' + error.message);

                        // Try again after a short delay
                        setTimeout(() => {
                            if (isAutomating) {
                                performAutomationCycle();
                            }
                        }, 5000);
                    });
            }, 1500);
        }

        // Start the first cycle
        performAutomationCycle();
    }

    // Function to submit the form
    function submitForm() {
        const submitButton = document.querySelector('input.webform-button--submit[data-drupal-selector="edit-submit"], input#edit-submit, button[type="submit"], input[type="submit"]');
        if (submitButton) {
            console.log("TransShield: Submitting form");
            submitButton.click();
            console.log(`TransShield: Form submitted ${loopCount} times`);
        } else {
            console.log("TransShield: Submit button not found");
        }
    }

    // Function to solve CAPTCHA
    async function solveCaptcha() {
        if (!captchaApiKey) {
            throw new Error('No CAPTCHA API key configured');
        }

        // Check for different types of CAPTCHAs
        const recaptchaV2 = document.querySelector('div.g-recaptcha, iframe[src*="recaptcha"]');
        const recaptchaV3 = document.querySelector('input[name="g-recaptcha-response"]');
        const hcaptcha = document.querySelector('div.h-captcha, iframe[src*="hcaptcha"]');

        if (recaptchaV2) {
            console.log("TransShield: Detected reCAPTCHA v2");
            return await solveRecaptchaV2();
        } else if (hcaptcha) {
            console.log("TransShield: Detected hCaptcha");
            return await solveHCaptcha();
        } else if (recaptchaV3) {
            console.log("TransShield: Detected reCAPTCHA v3");
            return await solveRecaptchaV3();
        } else {
            console.log("TransShield: No CAPTCHA detected");
            return true; // No CAPTCHA to solve
        }
    }

    // Function to solve reCAPTCHA v2
    async function solveRecaptchaV2() {
        const sitekey = document.querySelector('[data-sitekey]')?.getAttribute('data-sitekey') ||
                       document.querySelector('div.g-recaptcha')?.getAttribute('data-sitekey');

        if (!sitekey) {
            throw new Error('Could not find reCAPTCHA sitekey');
        }

        const url = window.location.href;
        const apiUrl = captchaProvider === '2captcha'
            ? 'https://2captcha.com/in.php'
            : 'https://api.nopecha.com/';

        // Submit CAPTCHA to solving service
        const submitResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                key: captchaApiKey,
                method: 'userrecaptcha',
                googlekey: sitekey,
                pageurl: url
            })
        });

        const submitResult = await submitResponse.text();
        if (!submitResult.startsWith('OK|')) {
            throw new Error('Failed to submit CAPTCHA: ' + submitResult);
        }

        const captchaId = submitResult.split('|')[1];

        // Poll for solution
        for (let i = 0; i < 30; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000));

            const resultResponse = await fetch(`${apiUrl}?key=${captchaApiKey}&action=get&id=${captchaId}`);
            const result = await resultResponse.text();

            if (result.startsWith('OK|')) {
                const token = result.split('|')[1];
                applyCaptchaSolution(token);
                return true;
            } else if (result !== 'CAPCHA_NOT_READY') {
                throw new Error('CAPTCHA solving failed: ' + result);
            }
        }

        throw new Error('CAPTCHA solving timeout');
    }

    // Function to solve reCAPTCHA v3
    async function solveRecaptchaV3() {
        // reCAPTCHA v3 is automatic, usually no manual solving needed
        console.log("TransShield: reCAPTCHA v3 detected, typically auto-handled");
        return true;
    }

    // Function to solve hCaptcha
    async function solveHCaptcha() {
        const sitekey = document.querySelector('[data-sitekey]')?.getAttribute('data-sitekey') ||
                       document.querySelector('div.h-captcha')?.getAttribute('data-sitekey');

        if (!sitekey) {
            throw new Error('Could not find hCaptcha sitekey');
        }

        const url = window.location.href;
        const apiUrl = captchaProvider === '2captcha'
            ? 'https://2captcha.com/in.php'
            : 'https://api.nopecha.com/';

        // Submit CAPTCHA to solving service
        const submitResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                key: captchaApiKey,
                method: 'hcaptcha',
                sitekey: sitekey,
                pageurl: url
            })
        });

        const submitResult = await submitResponse.text();
        if (!submitResult.startsWith('OK|')) {
            throw new Error('Failed to submit hCaptcha: ' + submitResult);
        }

        const captchaId = submitResult.split('|')[1];

        // Poll for solution
        for (let i = 0; i < 30; i++) {
            await new Promise(resolve => setTimeout(resolve, 5000));

            const resultResponse = await fetch(`${apiUrl}?key=${captchaApiKey}&action=get&id=${captchaId}`);
            const result = await resultResponse.text();

            if (result.startsWith('OK|')) {
                const token = result.split('|')[1];
                applyHCaptchaSolution(token);
                return true;
            } else if (result !== 'CAPCHA_NOT_READY') {
                throw new Error('hCaptcha solving failed: ' + result);
            }
        }

        throw new Error('hCaptcha solving timeout');
    }

    // Function to apply reCAPTCHA v2 solution
    function applyCaptchaSolution(token) {
        const responseField = document.querySelector('textarea[name="g-recaptcha-response"]');
        if (responseField) {
            responseField.value = token;
            responseField.style.display = 'block';

            // Trigger events
            const event = new Event('input', { bubbles: true });
            responseField.dispatchEvent(event);

            console.log("TransShield: Applied reCAPTCHA solution");
        }

        // Also try to trigger the callback if available
        if (window.grecaptcha && window.grecaptcha.getResponse) {
            try {
                window.grecaptcha.getResponse = () => token;
            } catch (e) {
                console.log("TransShield: Could not override grecaptcha.getResponse");
            }
        }
    }

    // Function to apply hCaptcha solution
    function applyHCaptchaSolution(token) {
        const responseField = document.querySelector('textarea[name="h-captcha-response"]');
        if (responseField) {
            responseField.value = token;
            responseField.style.display = 'block';

            // Trigger events
            const event = new Event('input', { bubbles: true });
            responseField.dispatchEvent(event);

            console.log("TransShield: Applied hCaptcha solution");
        }

        // Also try to trigger the callback if available
        if (window.hcaptcha && window.hcaptcha.getResponse) {
            try {
                window.hcaptcha.getResponse = () => token;
            } catch (e) {
                console.log("TransShield: Could not override hcaptcha.getResponse");
            }
        }
    }

    // --- scrollToSubmitButton function ---
})();