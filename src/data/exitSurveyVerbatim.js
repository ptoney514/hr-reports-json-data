/**
 * Exit Survey Verbatim Comments
 * Extracted from FY25 quarterly exit survey PDFs (Q1-Q4)
 * and FY26 quarterly exit survey PDFs (Q1-Q2)
 * 8-10 open-ended questions per quarter
 */

const verbatimData = {
  // FY25 Q1 — 20 responses
  "2024-09-30": [
    {
      questionId: "Q7",
      questionTitle: "Other, please specify below",
      context: "Primary departure reason",
      responses: [
        "Ready for more challenge.",
        "Employee verbal abuse",
        "Job description changed over the years to become work I was no longer interested in performing"
      ]
    },
    {
      questionId: "Q8",
      questionTitle: "Responses to Other below",
      context: "Contributing reasons for leaving",
      responses: [
        "Lack of UCOM culture, Shannon has no regard for sending us to outside work hour events, manager is not organized and consistently leaves people unread both internally and externally. Really embarrassing when external partners have to call or email just me and ask what's going on",
        "Culture of bullying, screaming, and control in The Success Center specifically",
        "Lack of career advancement opportunities and no remote/hybrid option available for administrative assistant role"
      ]
    },
    {
      questionId: "Q10",
      questionTitle: "If you answered \"no\", what could have been improved?",
      context: "Tools, resources, and work environment",
      responses: [
        "My director supervisor did everything in her power to make our office a positive, collaborative, and supportive work environment. With her gone, I'm not comfortable staying in my position, as the rest of the leadership team engages in practices that are in conflict with my own values and expectations for a reasonable work-life balance. If I stay, I will not be able to pursue my doctorate, attend additional position-related trainings/professional development opportunities, or even take a lunch. It shouldn't be this way.",
        "Tools and resources: generally yes. Work environment: absolutely not. I have shared some info in the answers below, and will be more specific in my in-person exit interview.",
        "My role was the first of its kind, with responsibilities divided between the Division of Equity, Diversity, and Inclusion and University Relations. While I received personal support and encouragement from the leadership team, the absence of a clear directive made it challenging to feel like I was making a meaningful impact at Creighton. Much of my time was consumed by administrative tasks, managing relationships with concerned alumni, and proposing strategies that, unfortunately, were not implemented.",
        "There was a complete lack of leadership on behalf of our Creative Director and Director of External Operations within the Athletics Department.",
        "It's hard for me to pinpoint what exactly could have made the work environment better, however, I would primarily focus this on the complete and utter disregard of accountability within the office. Multiple times our director failed in work tasks, executed his job poorly, and ultimately failed in every aspect of his job description and I've noticed nothing being done to hold this individual accountable in any way. Further more causing frustration within myself and my colleagues. This isn't the first instance of this either. Including myself, I have witnessed first-hand three talented and great people leave Creighton Athletics for this sole purpose. And to be completely honest, I firmly believe I won't be the last.",
        "New leadership, very toxic environment in the department at the top."
      ]
    },
    {
      questionId: "Q12",
      questionTitle: "Dissatisfied with career development — suggestions for improvement",
      context: "Career development satisfaction",
      responses: [
        "As Heidi said when I asked about opening a position that Chuck had \"it's out of the cards\". No way to advance in current position",
        "Direct supervisor provided phenomenal annual reviews, requested advancement/promotion, salary increases, etc. Was told no several years in a row.",
        "There were no opportunities for career advancement or promotion offered during my 5 years as an administrative assistant in the Law School. It is my understanding that my direct manager did ask the Dean if there was opportunity for advancement and he indicated there was not. Therefore, I looked outside the university.",
        "To answer the questions of availability of opportunities for career development. On the surface level I would have to say no. When I picture my life staying at Creighton I imagine myself in the same position until I retire.",
        "The recognition of performance question is a neutral answer for myself because I did feel like I was applauded for my work within the department.",
        "As I eluded to earlier, there was no room for promotional growth within the department and this was made known to me.",
        "In Career Services passed over two times.",
        "Not a solid career path",
        "I very much hoped my next career opportunity would come at Creighton, but there didn't seem to be a position here at Creighton like the one I found at another higher education institution, plus the salary range was much better."
      ]
    },
    {
      questionId: "Q14",
      questionTitle: "Dissatisfied with supervisor — suggestions for improvement",
      context: "Supervisor satisfaction",
      responses: [
        "Shannon has no time to actually know anyone on her team and people hold back when they are with her because there is a lack of trust and comfortability.",
        "See the final question for an overview; I will share more details during my in-person interview.",
        "Throughout my experiences working with and under our department's director I felt none of the above. Multiple instances were relayed to him and his superiors on this. We nearly had monthly meetings with one another where I practically begged him for assistance and leadership and nothing was reciprocated from him to alleviate this pressure. He is in total lack of accountability, leadership, organization, and communication.",
        "Communication, things did not get done before school started this fall. BUCKO grants given to students, calendars, forms updated.",
        "Only received criticism in my performance here at Creighton. Never received a kudos or good job.",
        "The manager who hired me was abruptly removed from her position this past fiscal year with no notice for us as team members.",
        "While I wasn't looking for a new opportunity and was instead recruited into the role I have accepted, I am very much looking forward to leaving that new leadership structure behind."
      ]
    },
    {
      questionId: "Q16",
      questionTitle: "Dissatisfied with compensation — suggestions for improvement",
      context: "Compensation satisfaction",
      responses: [
        "If I wasn't working 65 hours/week to get everything done, I might feel differently about my pay.",
        "Continual roadblock to advancement from leadership - not direct supervisor",
        "The pay for my role was very unsatisfactory. It was not a rate that was sustainable for me.",
        "The set pay is so low that the little raises given each year never amount to a fair wage.",
        "There aren't opportunities for merit bonuses or raises based on performance.",
        "While I have been happy with my position at Creighton, the pay is unfortunately much lower than what is offered at other universities. I accepted a promotion from Coordinator to Assistant Director at UNO with nearly a 40% increase in pay.",
        "The pay is just too low... even by Omaha standards.",
        "This is hard for me because of my enduring love of the University (my alma mater). I am leaving for a similar position at an institution here in the state of Nebraska and will get a 33% increase in salary.",
        "My salary just wasn't enough to cover what I needed it to as a newly single parent, and I was working a second job."
      ]
    },
    {
      questionId: "Q18",
      questionTitle: "Other incentives/benefits the University should consider",
      context: "Benefits and incentives",
      responses: [
        "Many jobs now offer hybrid or remote work opportunities.",
        "Also, more discussion around career advancement for the administrative assistant role.",
        "Although I'm not leaving specifically because of salary, money is always an issue, and I will make more money in a similar role at Metro Community College.",
        "Elective Vacation Time: ability to elect to pay for an additional week of PTO. Free parking for staff/faculty. Wellness Reimbursement Program.",
        "After 35 years, benefits better now. After my 16th year, I had to wait 5 years to get tuition remission.",
        "It would be great if Coordinators could be offered a set amount of Dining Dollars each month.",
        "Consider switching PTO to be one 'bucket' and up the amount."
      ]
    },
    {
      questionId: "Q22",
      questionTitle: "What was your favorite part about working here?",
      context: "Positive aspects of employment",
      responses: [
        "The photo/video team was great. Everyone outside of the directors and leadership in UCOM were great to work with.",
        "Helping students",
        "This was my first time working in higher ed, so learning how a university works and being able to learn how Creighton works/will grow.",
        "I like the atmosphere of a university and have always wanted to work at one.",
        "My boss/direct supervisor.",
        "My favorite part of any job that involves supporting students is always the students.",
        "Creighton is a great place to work - this is dependent upon leadership in your area though.",
        "I made good friends at Creighton.",
        "The amazing students and colleagues.",
        "Without a doubt, the mission. Creighton is home to some of the most dedicated, hardworking, and compassionate people.",
        "My fellow coworkers",
        "The comradery, friendships, and relationships built with my team.",
        "The best part of working at a university like Creighton is the relationships you build within the department.",
        "Working with students.",
        "Anything but being apart of University Communications, the School of Dentistry had truly amazing people, very positive environment I felt safe in.",
        "I enjoyed working with positive people in a collaborative environment.",
        "Reference the above question. I might recommend someone new to the workforce, but the wages would be hard to support a family.",
        "My favorite part of working at Creighton was working with my leader, Frannie.",
        "Amazing facilities and coworkers",
        "The people I work with and the mission. Supporting student-athletes was my biggest joy.",
        "People are great, the energy is great, folks are passionate and the mission is truly lived.",
        "Creighton gave me the opportunity to do hands-on work with PC technology, both new and old, in a heterogeneous technology environment"
      ]
    }
  ],

  // FY25 Q2 — 11 responses
  "2024-12-31": [
    {
      questionId: "Q7",
      questionTitle: "Other, please specify below",
      context: "Primary departure reason",
      responses: [
        "Racial inequality in department and school."
      ]
    },
    {
      questionId: "Q8",
      questionTitle: "Responses to Other below",
      context: "Contributing reasons for leaving",
      responses: [
        "Departmental leadership is lacking, support lacking, inadequate staffing, working from home has engendered a pervasive lackadaisical work environment, favoritism, lack of accountability and constant canceling of critical meetings that should provide clarity for overworked and underappreciated staff.",
        "Reoccurring issues for special needs patients & underprivileged.",
        "Dissatisfied with senior leadership in the athletic department."
      ]
    },
    {
      questionId: "Q10",
      questionTitle: "If you answered \"no\", what could have been improved?",
      context: "Tools, resources, and work environment",
      responses: [
        "Unable to obtain the necessary support needed in my department for workload. I was promised multiple times that I would be given help, but it was never followed through on. The consistent disrespect from faculty in how they speak to myself as well as students.",
        "Creighton employees are always told there is an open-door policy, to speak to Management or the Dean, but that isn't true.",
        "In my OS department I have seen racial inequality on a faculty level which has caused resentment in my department.",
        "The biggest missed resource here at the SOD is not having a Social Worker."
      ]
    },
    {
      questionId: "Q12",
      questionTitle: "Dissatisfied with career development — suggestions for improvement",
      context: "Career development satisfaction",
      responses: [
        "Always expected to do more, please and thank you just begins to sound like, 'take out the trash' when you're always being asked to do more",
        "This position is a great springboard into many medical field opportunities",
        "Foster relationships with employees who want to advance. Find opportunities to help facilitate their growth and development.",
        "The major FAFSA delays for 2024/2025 created an outrageous workload for every Financial Aid Department.",
        "From senior leadership and my direct supervisor, there wasn't much recognition for performance and individual contributions."
      ]
    },
    {
      questionId: "Q14",
      questionTitle: "Dissatisfied with supervisor — suggestions for improvement",
      context: "Supervisor satisfaction",
      responses: [
        "I always had my career goals in mind, I always knew that those goals were my decision. I made them and met them on my own. My supervisor had very little interest in my goals. I am very dissatisfied with the communication in this department.",
        "In my last days here at Creighton, it was brought to my attention that there was an issue with my professionalism which I find offensive. Therefore, to hear about something that has never been brought up one time seems retaliatory in nature which was not warranted.",
        "The majority reason for my want to leave Creighton is due to my direct supervisor. Struggles I encountered were, but not limited to: 1) Feeling like my personal career goals were not being invested in/fought for, 2) working in an environment containing a mass amount of miscommunication, 3) working in an environment that did not foster guidance or growth through constructive criticism.",
        "My boss's priorities didn't align with mine, and I felt there was little to no communication in what I could be doing to grow, areas to improve, or what the expectations were for me/work."
      ]
    },
    {
      questionId: "Q16",
      questionTitle: "Dissatisfied with compensation — suggestions for improvement",
      context: "Compensation satisfaction",
      responses: [
        "For my position and all of what I do, I should be paid substantially more than what I am. We continue to add multiple level Deans in our school, but only allot for minimal raises annually.",
        "But faculty are given opportunities hand over fist for advancement and growth which includes salary increases.",
        "The pay is 75% below market rate.",
        "Salary Negotiation"
      ]
    },
    {
      questionId: "Q18",
      questionTitle: "Other incentives/benefits the University should consider",
      context: "Benefits and incentives",
      responses: [
        "My understanding is the amount of PTO for vacation/sick can depend on the pay grade and number of years of service.",
        "You need to increase the sick time benefit - it is not realistic and a little bit unfair",
        "Some schools have a package that if you attend the annual health care appointments you could get a $500 bonus."
      ]
    },
    {
      questionId: "Q22",
      questionTitle: "What was your favorite part about working here?",
      context: "Positive aspects of employment",
      responses: [
        "Working with the students and GEO. Brandeis half price staff lunch.",
        "Despite my opinions regarding the daily operations of the department, I can say that I genuinely like and care about all of my co-workers, including my supervisor. They're good people, undisciplined, but good people.",
        "Working with the students",
        "Most of the people I worked with directly were wonderful, dedicated to their work, helpful, and kind.",
        "Provided opportunity to gain experience and certification (3rd Grade Stationary Engineers license), enjoyed co-workers",
        "Honestly the reason why I didn't leave sooner, aside from other job availability, was my personal staff that I oversaw.",
        "Coaches, and some of the admin staff I work with have been great.",
        "Support from managers, particularly in providing the flexibility needed to meet obligations to the US Army while maintaining a healthy work-family balance.",
        "I have a supportive and informative team in my department.",
        "Working with my students."
      ]
    }
  ],

  // FY25 Q3 — 20 responses
  "2025-03-31": [
    {
      questionId: "Q7",
      questionTitle: "Other, please specify below",
      context: "Primary departure reason",
      responses: [
        "Being harassed by department chair.",
        "Couple different reasons",
        "I would like to select many reasons - dissatisfied with direct supervisor, lack of flexibility, dissatisfied with university leadership, lack of work-life balance, unrealistic job expectations/workload/hours, university culture, job was not as expected."
      ]
    },
    {
      questionId: "Q8",
      questionTitle: "Responses to Other below",
      context: "Contributing reasons for leaving",
      responses: [
        "We are always short staffed and I was made to do the job of 3 people at times with no compensation or even appreciation.",
        "Hostile work environment created by my department chair.",
        "Retirement is the only reason I am leaving the University. It is time for my wife and I to enter the next phase of our lives."
      ]
    },
    {
      questionId: "Q10",
      questionTitle: "If you answered \"no\", what could have been improved?",
      context: "Tools, resources, and work environment",
      responses: [
        "Communication is lacking in all areas.",
        "Some acknowledgement and communication from the administration. Instead, I was told if I had a problem with my chair I could speak with Title IX.",
        "Even after requesting numerous times, I did not have access to my budget for 1.5 years; part of the job is to manage and project accommodation costs and I did not have the tools to be able to do this.",
        "There is a system we use called Clockwork that is outdated and hard to use.",
        "When I was first hired by Julie Nelson in August 2023, the leadership in GME and Internal Medicine was great. Once she retired in April 2024, GME changed the structure of leadership within GME and the programs. The new leadership did not provide the same level of support, communication, or guidance.",
        "I have thoroughly enjoyed my time in the Internal Medicine program and working with the physicians who are in the leadership roles. However, the restructuring of GME leadership created significant challenges.",
        "In Student Accessibility Services I started here in October 2023. I didn't have a computer monitor for 6 months of my job. I had to use my personal laptop for work purposes.",
        "In March or April 2023, I was asked by my boss to put together a proposal for requesting training opportunities. I did so, and it was approved. However, when I asked about the same opportunity the following year, I was told that it was no longer available to me, though similar opportunities were given to others."
      ]
    },
    {
      questionId: "Q12",
      questionTitle: "Dissatisfied with career development — suggestions for improvement",
      context: "Career development satisfaction",
      responses: [
        "There is no mentorship in the dental school for young/new faculty. It is based off of favoritism.",
        "As an Administrative Assistant, there were not many chances for career advancement in my department.",
        "Only people to recognize anything was Students, Dentists, and Dean Wallen",
        "I try to apply for higher positions, that were still at the dental school. They denied it, anyway they could keep me at the front desk they would.",
        "Based on the current way this role is positioned, a lot of responsibility and pressure is placed on the individual who holds this role.",
        "I came to Creighton planning to utilize tuition remission to help further my career goals, but in reality, as an hourly employee, the opportunity to take classes is very limited.",
        "Make time to follow through with performance meetings even if there are major holidays to work around.",
        "I would be up for a promotion in one year, but am more interested in new responsibilities/tasks.",
        "They require a minimum of 5 years of experience to move up to a manager position.",
        "When I transitioned from CARS to SAS I was working two jobs. The recognition I received was minimal despite taking on significantly more responsibility.",
        "As the Associate Director in SAS I'm at the highest place I can go in our office and there is no room for advancement.",
        "The Leadership in the Student Success Division is terrible."
      ]
    },
    {
      questionId: "Q14",
      questionTitle: "Dissatisfied with supervisor — suggestions for improvement",
      context: "Supervisor satisfaction",
      responses: [
        "The denigrating, repetitive emails I would receive created a horrible work environment.",
        "Joe was not clear on communication to me. There were ongoing issues with expectations and feedback that were never properly addressed.",
        "I have told my supervisor when I did my interview, then applied to the finance position that I want to learn everything. My supervisor in the dental school did not support my growth.",
        "The only time she would say anything was going over the goals at the end of the year.",
        "Tina shuts down any idea that you may have without considering it. There is no openness to new approaches or suggestions from staff.",
        "We worked great until Dr. Franco left, then Marjel and Tina did a complete 180.",
        "I have had a great relationship with my primary manager over the last 3.5 years."
      ]
    },
    {
      questionId: "Q16",
      questionTitle: "Dissatisfied with compensation — suggestions for improvement",
      context: "Compensation satisfaction",
      responses: [
        "It was low, but as expected for a dental school.",
        "My salary is not comparable to the job market of related jobs in the field outside of higher education.",
        "Any other job in the dental field would pay more than $20 starting off. Raises are more than $0.50.",
        "After receiving my Master's degree in May 2024, I was under the assumption that some form of a compensation change would occur. This did not take place.",
        "I was not dissatisfied with my pay when I was originally hired and the position and duties I was originally hired for. However, since Julie's departure, I have taken on the responsibilities and duties she held as our Program Manager and I was not paid for that increase."
      ]
    },
    {
      questionId: "Q18",
      questionTitle: "Other incentives/benefits the University should consider",
      context: "Benefits and incentives",
      responses: [
        "I was told I am not allowed to take sick time without my chair's approval. That my chair has the right to tell me to move a doctor's appointment. That I have to disclose what doctor I saw to HR to take a sick day.",
        "Outside of Creighton gym membership options",
        "Actually do 2 weeks off for Christmas break.",
        "More hours accrued each month for vacation would be nice.",
        "The medical insurance that is provided is not the best.",
        "Here at Creighton, I had to pay almost $200 a month for insurance. I also don't appreciate how in order to get birth control I had to get it through Express Scripts. The maternity leave policy also needs improvement."
      ]
    },
    {
      questionId: "Q22",
      questionTitle: "What was your favorite part about working here?",
      context: "Positive aspects of employment",
      responses: [
        "I enjoyed working with my team and educating students of safety",
        "Meeting some nice people.",
        "The students.",
        "Working with the work study students in the office - finding a sense of belonging with the other Directors in the Division after having open conversations, and doing the compliance based work for supporting students with disabilities.",
        "The culture of the department in HAS and working with my colleagues.",
        "Working with my student workers and the positive interactions with students.",
        "Working with great people and great student athletes.",
        "Honestly the students and Tess. They are the only reason that I stayed here for as long as I did.",
        "I also loved when I first started it was my first job ever that I was happy in a workplace, never felt like I had to defend myself and I was completely honest and knew that I wouldn't be judged."
      ]
    }
  ],

  // FY25 Q4 — 18 responses
  "2025-06-30": [
    {
      questionId: "Q7",
      questionTitle: "Other, please specify below",
      context: "Primary departure reason",
      responses: [
        "The team I worked with was comprised of some of the nicest people I've ever had the pleasure to work with. Unfortunately, the salary is very low in comparison to other similarly situated roles and there is no path for advancement/promotion.",
        "Offered an opportunity with a significant pay increase that my family needed.",
        "Tuition Remission and the way that I have been treated when it comes to admissions for grad school. I have 50% of a Master's Degree and was kicked out of the program and denied admissions after the designated waiting time."
      ]
    },
    {
      questionId: "Q8",
      questionTitle: "Responses to Other below",
      context: "Contributing reasons for leaving",
      responses: [
        "Lack of support from upper administration for this particular position - seems like more of a performative or token position to dedicate some marginal effort to community-engaged learning when it is not truly a priority of the institution."
      ]
    },
    {
      questionId: "Q10",
      questionTitle: "If you answered \"no\", what could have been improved?",
      context: "Tools, resources, and work environment",
      responses: [
        "This area needs additional staffing or, at minimum, to be placed within a division who has the ability and resources to support the position objectives with a team of like-minded staff.",
        "My role was incredibly isolating. Because my offices were located outside UCOM, I did not have many opportunities to get to know my team.",
        "In my experience at Creighton, resources to do work on my projects were scarce.",
        "Another item lacking for projects time and again was university data. Data across the university is consistently outdated or does not exist.",
        "As far as work environment, I accepted a full-time position with Creighton (from contracting) with the understanding that my position would remain a mostly work from home position. The return-to-office policy changed that expectation.",
        "Finally, I do want to say that I've worked with a lot of great folks at Creighton, and I do appreciate that time.",
        "While the team is overall supportive and things like conferences and materials were provided, there is a serious lack of adequate staffing."
      ]
    },
    {
      questionId: "Q12",
      questionTitle: "Dissatisfied with career development — suggestions for improvement",
      context: "Career development satisfaction",
      responses: [
        "I was in the same position for years but was expected to take on a higher role without the official designation of a higher position.",
        "I felt that, at multiple times, I was led to believe that available opportunities for career advancement or growth in my role were offered but never materialized.",
        "It was challenging to feel seen in my work and appreciated for what I contributed because I was physically not in the office with the rest of the team.",
        "I was asked to apply for promotions and didn't receive any of them, I would have stayed if there was a bit more opportunities to move up in the department/team.",
        "Passed over for a promotion by a candidate with zero experience."
      ]
    },
    {
      questionId: "Q14",
      questionTitle: "Dissatisfied with supervisor — suggestions for improvement",
      context: "Supervisor satisfaction",
      responses: [
        "My supervisor takes on too many roles in the department/center. In turn, he was rarely available outside of a few weeks every few months.",
        "The VPGEO has many areas to manage and oversee, but was very transparent from the beginning of her tenure that she did not really understand the role of community-engaged learning in GEO and Creighton, nor my position expectations.",
        "My 1:1 meetings would either be really productive or I would leave frustrated or in tears.",
        "Poor hiring decision to try to combine academic support and traditional tenure-track research position.",
        "Performance evaluation was based on inconsistent measures and often relied on perception or even against colleagues rather than objective criteria.",
        "I have loved my time at Creighton and truly am so appreciative of my experience here."
      ]
    },
    {
      questionId: "Q16",
      questionTitle: "Dissatisfied with compensation — suggestions for improvement",
      context: "Compensation satisfaction",
      responses: [
        "The pay for this position is a little lower than the market average.",
        "It is known that IT project manager salary at Creighton is less than the standard, but I was willing to overlook lesser pay to stay with Creighton while working from home.",
        "42,000 is not enough for a single person to live on by themselves without a second job, even with additional benefits.",
        "Creighton pays below the average for Athletic Trainers.",
        "Pay was unsatisfactory",
        "Salary is low compared to other similar roles at other institutions",
        "Pay raise for Shift Lead is not worth the extra workload required of the position."
      ]
    },
    {
      questionId: "Q18",
      questionTitle: "Other incentives/benefits the University should consider",
      context: "Benefits and incentives",
      responses: [
        "Offering some sort of assistance with childcare, either finding resources or childcare on campus.",
        "Benefits package is good.",
        "Stronger parental leave policy to reflect the justice and care for family that a Catholic institution should represent. YMCA daycare partnership would be valuable.",
        "Benefits were generally pretty good, but I dislike BetterHelp and had a hard time finding a therapy provider from the EAP.",
        "No, I think Creighton has an amazing benefits package.",
        "Longer bereavement leave and paid parental leave.",
        "More transparency for tuition remission."
      ]
    },
    {
      questionId: "Q22",
      questionTitle: "What was your favorite part about working here?",
      context: "Positive aspects of employment",
      responses: [
        "I was fairly surprised and happy with the parental leave options that Creighton offered.",
        "Coworkers",
        "The feeling and living of the Jesuit Charisms and the people.",
        "The culture within the Global Engagement Office is very strong and relational.",
        "There are great people at the University and I genuinely enjoyed getting to know some of my colleagues.",
        "My favorite part about working here was the relationships I made with co-workers through the organization.",
        "I really appreciated how I got to do kind of my own thing with some direction from my boss and I got to be creative.",
        "Creighton takes care of its people. It has offered me the ability to work on OPT (as a student) and H1B-Visa (as staff).",
        "The people I got to work with. Not only in my department but many people in other departments as well.",
        "The people and overall environment of uplifting each other.",
        "The people",
        "My overall team culture and the friendships I made",
        "My direct supervisor is a truly spectacular human who is often underrecognized by the larger community.",
        "I liked the hybrid schedule and the culture in my department was enjoyable.",
        "The people.",
        "Co workers"
      ]
    }
  ],

  // FY26 Q1 — 15 responses
  "2025-09-30": [
    {
      questionId: "Q7",
      questionTitle: "Other, please specify below",
      context: "Primary departure reason",
      responses: [
        "Organizational silos and Lack of trust in Senior Leadership to advance my cause within the organization.",
        "My job as admissions coordinator was eliminated, and I was given the option to either \"sever my ties with Creighton\" or accept a job as administrative assistant. The entire situation has caused extreme anxiety and panic attacks due to disorganization and complete lack of training for the position. The previous admin asst, Jennie Ayers, was hostile, rude, and provided no training or help whatsoever while she was transitioning to her new role working in the Hub. I should not be forced into a job i don't want or have no interest in. I have been placed into a situation where my only outcome is failure. This was supposed to be a \"lateral\" move because the pay stayed the same, but it was clearly a demotion. The way this forced job change was handled and announced to the School of Dentistry was embarrassing, disrespectful, and completely humiliating. Many colleagues approached me to congratulate me on my promotion, which this absolutely was not a promotion or anything I wanted. Others came up to ask me what I did wrong to get demoted, and I have never had anything but great performance reviews. So I lost the job that I absolutely LOVED and planned on retiring from, was forced into a job that I don't want, and then had to explain to everyone that I didn't get in trouble and was not promoted. Since mid-May, the stress and anxiety this has caused is something that no one should have to tolerate. I haven't been able to sleep, and I have lost over 15 lbs. from not being able to eat. My manager has been fully aware of how this has affected me. Leadership above him has not acknowledged me, been in contact with me, or tried to help in any way.",
        "Not the night shift supervisor but the FTO I was assigned."
      ]
    },
    {
      questionId: "Q8",
      questionTitle: "Responses to Other below",
      context: "Contributing reasons for leaving",
      responses: [
        "I was significantly single threaded with few clear career guard rails and unfulfilled promises to get help with my workload. Also, requests to develop processes were met with spun wheels, as my workload precluded my ability to influence process improvement. In short, I burned out, and someone else came looking for me."
      ]
    },
    {
      questionId: "Q10",
      questionTitle: "If you answered \"no\", what could have been improved?",
      context: "Tools, resources, and work environment",
      responses: [
        "I would have liked to have someone cross trained for my position. Not all of the intricacies necessarily, but enough to be able to take a day off or a true vacation day without having to check my email, return voicemails, etc.",
        "Training and onboarding for the position. Training for different tasks expected. Help when it's being asked.",
        "The work environment was chaotic, demanding, and demeaning. I witnessed 23 people leave my department (which at capacity hosts 15) within about 3.5 years. When staff in my department struggled, they were often shamed and pushed harder. When people asked for space, more was demanded of them. People were pushed to the breaking point and they broke. People did not feel safe asking for help outside of the department and those who did ask did not feel like any useful change happened.",
        "We needed to be supported to hold our supervisor to account. She burned through staff members and needs training in how to be a more supportive and encouraging supervisor. She needs to learn to give people space to care for themselves and their family. She needed to take Creighton values to heart.",
        "I received some tools and opportunities, but I was over utilized and asked to be a technical resource for an underqualified and underutilized classroom support team on campus. When I was allowed to just do my job, I loved my job. However, those moments were further apart than I could muster patience for. IT senior director level leadership needs to stop trying to be the SMEs and work to coordinate the SMEs and trust their vision and counsel. Architects and Admins are paid according to their skills, and it is a disservice to the university when those people are not included in planning conversations from the outset. Too often I encountered projects and road mapping that could have saved SIGNIFICANT money if the architects would have been included in the planning. IT continues to promote an 'anti-silo' mentality, but the senior directors are the primary contributors to the silo culture. Until these items change, the department of IT will never move forward efficiently and will being to stagnate. Scott Taylor is a get leader, however, he is being sabotaged by his senior directors.",
        "Training, time for training, grace/understanding from faculty (regarding being forced into a position with no training but still trying to help them and make the best of it), more employees to balance the work load",
        "The scope of this position is too wide and oversees too many things for one person to adequately manage in a 40 hour work week. I am the only person in my office and overseeing all of orientation (summer preview and welcome week), all transition events, all commuter events and success, and all first-gen programming and success, is a lot for one person to manage. This position needs more professional staff dedicated to the work that is being done to avoid burnout of the person currently working this position.",
        "The FTO was the worst person I've ever had the displeasure of working alongside for a painstaking ten hours. This ten hours included snide remarks about others, disapproving looks towards me, and an overall negative attitude toward the job and training."
      ]
    },
    {
      questionId: "Q12",
      questionTitle: "Dissatisfied with career development — suggestions for improvement",
      context: "Career development satisfaction",
      responses: [
        "I felt in all aspects listed above I was not given ample opportunities due to work overload, and lack of support and trust from my direct supervisor.",
        "My manager and his manager were fully aware of my dental background, degree, etc. My job as admissions coordinator should've been expanded and given more responsibilities, such as advising applicants and prospective students, attending career fairs and conferences, etc. My manager is incredibly busy, and my background and education would've allowed me to easily take on some of his duties.",
        "For career training, virtually everything offered was in-house or through Jesuit school channels. It was difficult to fund going to a conference directly related to my work that was outside of that network. Career advancement opportunities did not exist in my role.",
        "I did not feel there was any room to be promoted within my team/department",
        "There was never an opportunity for career development as there was no time or money to provide to us to develop us further. I inquired about opportunities, but was told it didnt fit the scope of my work, or I didnt have the time to complete it as the demands of my work did not allow for additional time to develop my skills.",
        "I rarely received a thank you or good job from anyone on the work being done, and often times felt like no one even knew what I was working on or doing.",
        "There was talk of advancing and promoting my position for the three years I was here and was told my position was being promoted, and yet nothing ever came of it."
      ]
    },
    {
      questionId: "Q14",
      questionTitle: "Dissatisfied with supervisor — suggestions for improvement",
      context: "Supervisor satisfaction",
      responses: [
        "I was overall very dissatisfied with my supervisor due to a lack of trust, support, autonomy and unrealistic expectations and workload. My supervisor was rude, abrasive, and unempathetic towards me when I reached out or communicated honestly about needing support or being overworked. She blamed me for mistakes that I did not make and did not give me ample credit or time to address the errors I did make. Overall, I felt very unsafe and anxious coming to her for support. Throughout the last 6 months of my employment under her, she has micromanaged me to the point where it made me second-guess my ability to do my work effectively, be creative and productive, which has taken an immense toll on my mental health. She has treated me like a burden and has been cold to me since my yearly review in July 2025, failing to prepare or warn me that I would be meeting with an HR generalist to be put on a performance improvement plan before the meeting. When asked why I was not given a warning that the meeting would involve not only her but also an HR generalist to put me on this plan, she claimed it was HR policy that she could not warn me beforehand. I have since found out this may not be true.",
        "I answered based upon my current supervisor which I just started working with a month ago. She did not have the opportunity to understand my goals nor offer/measure my performance.",
        "I will forward additional detail regarding my departure to Michele Wafer so I may offer a view from my lens.",
        "My supervisor wanted to push me into areas of her own interest, not what I cared about. She did not take time to get to know me on a personal level. I was just a tool for her own advancement. I know she attempted to get to know me at times, but seemed to lack the tools on how to do so.",
        "Communication was inconsistent and chaotic. We were always behind and more was always being asked of us. I would discuss with my supervisor how to present information to the community, and then would follow through, but after sharing, my supervisor would add something new or put a new twist on things that I felt I then had to support to show unity. I felt like I could never do my job well because I was always trying to catch up, to perform more, and to adjust to changing expectations.",
        "My supervisor also seemed to want to insulate our department from anyone else at Creighton. It seemed she did not want us talking with others on campus, sharing ideas, or collaborating. I found this incredibly stifling and tried to move beyond this. I was regularly pushed back into \"my corner\" of the department and discouraged from working with anyone beyond our department.",
        "My supervisor was also a polarizing figure. Some people really appreciated her. They saw her as someone who could do no wrong. But this hurt those of us in the department who were drowning under her pressure and shifting expectations. Even fellow co-workers in the department had strong feelings about my supervisor, some admiring her unconditionally and others trying to find any way to escape. Some people gave her unwavering support and believed her every word; some of us became skeptical of anything she said and found it hard to listen to whatever she asked of us. At times I felt like I was going crazy because I didn't know which version of my supervisor was true. I could see the good she did, I could see her strategic mind at work, but I could also see her hurting staff and speaking ill of community members and others not present. Regardless, it seemed there was no recourse for us to have any issues addressed without putting our jobs (and future likelihood of jobs) jeopardized. And so we stay silent.",
        "My direct supervisor knows very little about my field and was overly confrontational when I presented new ideas to improve the Creighton classrooms. I asked for processes to be discussed and then we would go nowhere with it. I know our time together was short, and I appreciate his ability to provide some structure; however, he changed an entire process in the middle of a FY25 classroom refresh cycle, thereby delaying the implementation so significantly, that it has yet to start. His head is going toward the right place, but his timing was not appreciated.",
        "My manager and his manager were fully aware of my dental background, degree, etc. My job as admissions coordinator should've been expanded and given more responsibilities, such as advising applicants and prospective students, attending career fairs and conferences, etc. My manager is incredibly busy, and my background and education would've allowed me to easily take on some of his duties. We spoke a couple of times about my desire to work on a Master's degree in the hopes of having a higher role in admissions.",
        "Audra is a wonderful human being and she's very nice. I think some of her strengths include her flexibility, helpfulness, care, and drive. On the other hand she can also be rigid about some things. I think it's sometimes difficult to talk to her/ask her questions. I don't think she realizes that sometimes she's not hearing what you're saying and doesn't explain well. I think maybe just a seminar or training could address that",
        "Not once did the FTO ask me about who I was or anything personal I was just an assignment to him and not a person he should be training. After one day I decided that there was no way I was going to be able to continue this job opportunity if it was with him for three weeks."
      ]
    },
    {
      questionId: "Q16",
      questionTitle: "Dissatisfied with compensation — suggestions for improvement",
      context: "Compensation satisfaction",
      responses: [
        "I was told in the interview a higher pay then I was able to negotiate for myself. Also with all of what is asked in the position the pay is not enough.",
        "I never saw my job description when I took my current roles, and I have been chronically underpaid for my position. I have been making ~$15K-$25K per year less than my peers in similar institutions.",
        "The pay for staff at Creighton is disappointing. It is not a livable wage unless you are married or have a second income.",
        "While my salary was not the primary reason for me leaving Creighton, it was definitely something that was far too low for the amount of work and quality of work that I was producing. I felt that we exceeded expectations, particularly on the social media side of things, and got little-to-no recognition/pay for it. Furthermore, the Creighton Athletics visual brand has been created and transformed into the best look across the conference. Overall, I know that the pay didn't reflect the quality of work being produced and, while this wasn't a problem now, I could see it becoming a problem had I stayed.",
        "The maximum pay for this position, which I received, is much lower than for other jobs in the Omaha area requiring the same credentials. I had to find another job just to pay my bills and support my kids.",
        "I am happy with my salary, but slightly dissatisfied with my raise from last year since inflation has been so bad. Even one percent more would be nice"
      ]
    },
    {
      questionId: "Q18",
      questionTitle: "Other incentives/benefits the University should consider",
      context: "Benefits and incentives",
      responses: [
        "I do want to acknowledge that the University's willingness to let me work from home was greatly appreciated. That was HUGE for me and our family. I am very appreciative!",
        "Overall, I was satisfied with the benefits package. The only problem I had with it was that the vacation time did not align with work in the Athletic Department. I completely understand that athletics works weird hours. However, there were many times I found myself working for 30-60 consecutive days with no days off (even if I didn't come into the office). Not to mention, there was no raise in pay to compensate for this, despite a maintained high quality of work being produced.",
        "Health insurance that covers more and costs less.",
        "Remove the working spouse charge for medical insurance, as it's an extra burden to have to work towards two deductibles and navigate two medical insurance systems for one family.",
        "When you use the Employee Assistance Program to use BetterHelp.com to find a therapist for 8 free sessions (great!), then cover that same therapy with the medical insurance instead of having to start back over from scratch.",
        "I think the spacing of holidays is tough, with the biggest two gaps being between Martin Luther King Day and Good Friday and then between Labor Day and Thanksgiving. One day off a month would be wonderful or even just adding a floating holiday. Of course Christmas break is amazing and I am very thankful we have that.",
        "I think working from home should be offered more. For example, I work from home on Fridays but someone else on my team works from home Mondays and Fridays. I think an extra day would help a lot.",
        "I also think dress code is something that gets people down."
      ]
    },
    {
      questionId: "Q22",
      questionTitle: "What was your favorite part about working here?",
      context: "Positive aspects of employment",
      responses: [
        "My favorite part of working at Creighton, specifically in Alumni/University Relations, was the opportunity to connect with alumni and hear firsthand about the impact Creighton had on their lives. I also enjoyed participating in quarterly service hours with my department colleagues and serving on the Service and Social Committee and the Equity, Diversity, and Inclusion Council within University Relations. These committees and councils gave me a true sense of fulfillment and purpose that I was lacking in my day-to-day role, as well as provided me the opportunity to make connections with campus partners and the Omaha community.",
        "I love the community at Creighton. It's mostly a great group of people, all working together toward a shared goal.",
        "The wonderful colleagues I worked directly with over the almost 13 years I've been at CU. Such amazing, knowledgeable, dedicated people. We (CU, I still say we...) need them to know they are valued with words and actions by their supervisors and university leadership. Not a plaque, a luncheon, etc. Truly value them and their expertise -- show them, collaborate with them, ask them for their input. I'm not the first to leave CU for this exact reason.",
        "I enjoyed the university culture and the people I worked with.",
        "My supervisor. Stef Keator treated me well and like an adult and was very helpful and responsive.",
        "I liked the broader sense of community and the opportunities for mission engagement. I wanted to dive deeper into the Jesuit charism of Creighton but felt discouraged to do so by my supervisor.",
        "The people who do the actual work. Some leaders are great people, but need help leading.",
        "I made several life-long friends during my almost 5 years here at Creighton. I absolutely thrived and loved my job as Admissions Coordinator, and would have happily taken on more responsibilities in that role and worked until retirement. My time spent working with applicants and prospective students was very rewarding.",
        "I love how much the culture in the Athletic Department has improved in my time here. This has truly transformed into a positive work environment that is enjoyable to be in.",
        "Supporting students and seeing student growth.",
        "I really like the events and also Christmas break. For events things like the Enrollment Management and university wide employee Christmas parties, or just the little things put on by the social committee I think it is or the little parties we have and spirit days.",
        "THE STUDENTS! Working with the students has been the absolute highlight of my work. It's been such a joy to work along side them, mentor and guide them, and get to know them through their leadership opportunities on campus.",
        "The few good people within Public Safety initially made my decision seem likable until I was paired with my FTO."
      ]
    },
    {
      questionId: "Q23",
      questionTitle: "If not, in what ways could we improve?",
      context: "Inclusive culture",
      responses: [
        "If Creighton is to be a caring, inclusive, and diverse culture, then managers need to be held to account for fostering this culture. Employees need some way of flagging, anonymously, as supervisors struggle to maintain this culture. This should not be punitive, but it does need to have consequences.",
        "Of the 23 people who left while I was at Creighton, only 3 were at Creighton for more than 5 years. Two, including myself, were at Creighton for about 3.5 years, and the rest were there less than that. My department lost 7 people my first year, 3 my second, 6 my third, and 4 my fourth year (plus 3 who were structurally transferred out). I calculated the turnover rate of 87.5% in 2022, 31.5% in 2023, 55.5% in 2024 (not including restructuring; 111% including staff moved to another department) and 46.1% in year 4. No one at Creighton seemed to notice or care.",
        "My supervisor is a good person and showed that she does care for staff and our development at many points. And yet, she struggles to show this care consistently. She struggles to form staff in a way consistent with cura personalis or magis. She needs training and she needs someone who can hold her accountable. She is hurting people, creating a chaotic environment in a department that serves the community. This creates poor programming and a resulting poor face for Creighton in the community. Moreover, the people who left have a poor impression of Creighton based on their experience in the department, and even if they liked their experience in the department, they imbibed the bitterness towards the university that was cultivated in the department.",
        "Managers, especially leaders of departments, need to have some checks on their authority. Living out Creighton's values should be part of their annual evaluation and needs (anonymous) input from their staff, students, and others who must work with the consequences of their actions.",
        "At the School of Dentistry, the overall environment is not caring and inclusive. The amount of favoritism within the SOD is shocking to say the least. Opinions of staff are not valued or taken seriously. Staff are looked down upon by leadership and faculty, but there is no way to grow or advance as a staff member because positions keep being eliminated. Everyone is doing the work of 2-3 people, which leads to burn out and low morale. Leadership does nothing to promote a positive work environment. It's absolutely clear that the people in higher positions are all about self-preservation, and they will not speak up for what is right or fight for the people who work under them.",
        "The individuals that I worked with were supportive and caring. But as an institution, there was not a place for a female clergy person to be included in the life of the university. This was brought to light in many ways, both small and large. HR didn't have the title \"Reverend\" available to me, though Father, Brother and a lot of other male-centric religious titles were offered (this has since been changed). My Reverend title was somehow removed from the Creighton online ministries page at one point. I had to hide that I was an ordained minister at the Baccalaureate Mass but was still expected to show up and usher. Students and parents looked at me quizzically when I was on campus wearing a clerical collar, as if it wasn't possible to have a female clergy person exist. It was also made clear in myriad ways that my ordination was seen as lessor than the priests on campus, which blocked real collaboration.",
        "It just feels to me that sometimes Creighton asks for feedback (smaller scale) and doesn't listen. I also don't think not all roles are equally thanked when being addressed (undergraduate work is always emphasized, which they deserve but at the same time it feels like other roles are forgotten).",
        "Encouraging supervisors to create a better team dynamic, and encourage relationship building across departments. Each department/division feels so siloed and for new folks, it can be hard to build relationships with people."
      ]
    },
    {
      questionId: "Q24",
      questionTitle: "Please list any additional comments about your job and/or Creighton",
      context: "Additional comments and suggestions",
      responses: [
        "I am disappointed that despite the recurring turnover of my colleagues who report to my manager, her ongoing unprofessionalism and lack of support as a manager have not been seriously addressed. Instead, she has been promoted and is recognized as an irreplaceable asset to the department, despite having caused various issues. I hope that after reading my responses to this survey, Creighton's Human Resources team makes a conscious effort to help provide improvements that better support the person who takes over my role next.",
        "Perhaps ensure persons in certain positions receive appropriate training on the programs and platforms they will be utilizing. And make sure they have clearcut resources/contact persons when questions arise regarding those platforms.",
        "I like Creighton and felt sad to move on. It was unsustainable for me to stay in the current department. I raised some issues when I first arrived at Creighton and encouraged a co-worker to do the same when she noticed things in the department. The response I got from HR was that they could not do anything to help my supervisor except offer opportunities. Maybe I shouldn't have given up or maybe I should have conveyed my expectations more seriously, or maybe I should have kept reporting things, but my supervisor needs help. She is not effectively managing staff and is the main reason I left Creighton. I could not handle the ever-increasing workload, the demands on my time, and the shifting expectations. I could not stay in an environment where others were being shamed for not doing their work to her expectations; I felt complicit. I received the \"Employee of the Year\" award in my department last year, nominated by my colleagues. I received merit increases each year I was at Creighton. I participated in NOVICE, Creighton Colleagues, a CIPER Associates and Scholars program, and I helped develop a Managing for Mission program. I worked hard, was valued by those around me, and wanted to continue to get involved, but my supervisor and department were the main blocks for letting me get engaged. Something needed to change, but no one seemed able to help.",
        "The LE Architect is a massively diverse position and a basic catch-all position, in many cases. There is a significant gap between the LE support team and the Architect role that was expected to be filled by the Architect. Creighton University has no Tier 3 or engineering AV team and that is a gap that needs to be filled by at least 2 FTE.",
        "With regards to my last position, Administrative Assistant, things are so confusing and overwhelming that I have no idea what to even suggest. The amount of help that some departments need (Healthy Smiles/Community Dentistry, General Dentistry, and Prosthodontics) is so great that they should either have their own assistants, or the number of Administrative assistants overall needs to be increased. When I started in 2020, there were 4 admin assts, and now it's been reduced to just 2. Retention in these positions has been difficult, and the last 2 quit on the exact same day, just after I was forced to take the position. Clearly, there is something wrong and it needs to be corrected. I haven't been in the position long enough to comment more, but I hope someone figures it out for the sake of the faculty and their needs."
      ]
    }
  ],

  // FY26 Q2 — 10 responses
  "2025-12-31": [
    {
      questionId: "Q10",
      questionTitle: "If you answered \"no\", what could have been improved?",
      context: "Tools, resources, and work environment",
      responses: [
        "a formal performance evaluation that is filed and signed by the supervisor and the faculty member--setting clear expectations and goals each year",
        "More opportunities to meet and discuss ways to get help to continue to be successful. My manager rarely had time for meetings and that was known amongst the staff that he is always hard to reach. I asked for help many times this semester but was told to just \"hold on\" until the holidays."
      ]
    },
    {
      questionId: "Q12",
      questionTitle: "Dissatisfied with career development — suggestions for improvement",
      context: "Career development satisfaction",
      responses: [
        "Tell your staff good job more often. We work in a stressful environment and only hear of the times we needed to do better, not when we were doing a good job.",
        "There are only 6 positions of leadership"
      ]
    },
    {
      questionId: "Q14",
      questionTitle: "Dissatisfied with supervisor — suggestions for improvement",
      context: "Supervisor satisfaction",
      responses: [
        "there was a significant lack of mentorship, willingness to improve the team dynamic, holding individuals on the team to different standards, bullying and aggressive behavior when mistakes were made",
        "I rarely could sit down with him to get feedback on my performance except once at the end of the fiscal year. Communication was hard as he is rarely available with his two jobs he performs."
      ]
    },
    {
      questionId: "Q16",
      questionTitle: "Dissatisfied with compensation — suggestions for improvement",
      context: "Compensation satisfaction",
      responses: [
        "Lower than initially expected for position asking for bachelor's degree/ healthcare experience",
        "While overall pay is reasonable, I don't feel that overtime should be approved ahead of time as most hourly positions allow overtime as it occurs. If GME doesn't want to pay program managers overtime then they should consider increasing the pay and making the position salary. Additionally, while the program manager role is classified as entry level, it is not an entry level role by any means. The role requires someone knowable in healthcare who's detail-oriented, has good customer services skills, and enjoys a multitude of tasks as there is a lot of juggling many different responsibilities, along with having a bachelors degree.",
        "Based on the ATC professional salary survey, we are underpaid here at Creighton. I also was made aware that a male who was hired months after I was promoted to salaried made thousands more than me per year."
      ]
    },
    {
      questionId: "Q18",
      questionTitle: "Other incentives/benefits the University should consider",
      context: "Benefits and incentives",
      responses: [
        "I believe higher pay and more vacation days"
      ]
    },
    {
      questionId: "Q22",
      questionTitle: "What was your favorite part about working here?",
      context: "Positive aspects of employment",
      responses: [
        "coworkers, manager, and variety in my day to day",
        "Creighton is truly an amazing institution. Despite my experience within the program, I felt a part of the institution and enjoyed collaborating with faculty and staff from other programs, schools, and colleges. I believe in the mission of this institution, and I am still proud to say I was a part of the Creighton family. I have met so many amazing people and been a part of many different things during my time here, and I will forever be changed in a positive way. I am incredibly sad to leave Creighton as a faculty member.",
        "1) The people. 2) I felt I contributed to the successful training of psychiatry resident physicians.",
        "The most enjoyable part of working here is the variety of individuals I had the opportunity to work with including staff, faculty, and students. During my time at the College of Nursing, I had the opportunity to take lead on a improvement project for compliance which involved collecting data on out of pocket costs Sophomore students incurred for completing compliances. This project allowed me to interact with individuals I would not have normally along with allowing me to use my creative side for completing both a Word document and PowerPoint presentation. Being lead on this project is one of the highlights of my time at Creighton University.",
        "The culture and people are great!",
        "My coworkers at the Ryan Athletic Training room were amazing mentors and people to work with.",
        "There are a lot of fun events within the campus and in this particular position. Animal resources management always makes sure you're ok and asks what you need to feel supported.",
        "Good work environment, great supervisors, good people all around",
        "Being a part of a welcoming environment and working with like minded people as myself."
      ]
    },
    {
      questionId: "Q23",
      questionTitle: "If not, in what ways could we improve?",
      context: "Inclusive culture",
      responses: [
        "look into more expansive interpretation services that could allow for clinical research to recruit more non-English speaking participants. Non-english speaking patients are many times excluded because of this.",
        "In terms of culture among coworkers I did feel included and cared for",
        "Women ATCs don't enjoy working here because of an associate athletic trainer. There is no diversity in the staff we hire."
      ]
    },
    {
      questionId: "Q24",
      questionTitle: "Please list any additional comments about your job and/or Creighton",
      context: "Additional comments and suggestions",
      responses: [
        "Same as above. I believe it is really important to have a diverse population of study participants. Because we do not have widely accessible interpretation services (phone call interpretation, in person interpretation, written interpretation for consent forms etc.) we miss out on many potential participants. Data could better reflect the public population if these patients were not excluded solely based on inability or lack of confidence in the English language",
        "Thank you for the opportunity to be a part of this amazing institution! Please also consider addressing how faculty are formally evaluated. I felt like I was targeted and did not have an outlet to seek help without experiencing retaliation.",
        "Salary. I know this is \"same-o, same-o\", but in talking with colleagues at national meetings Creighton's salary scale for this position falls below most other universities in the country.",
        "To whom it may concern, I am writing this letter to voice my concerns about how my transition from the College of Nursing to Graduate Medical Education was handled. On March 12, I was offered a Program Manager role at Graduate Medical Education which I accepted. As courtesy I gave my two-week notice to the College of Nursing that I would be leaving my role as Clinical Coordinator. During this timeframe my supervisor at the College of Nursing, Quinton Freeman and my new supervisor, Stefanie Keator at Graduate Medical Education along with Human Resources added a stipulation to my offer letter stating I would remain on with the College of Nursing until May 15 to assist with the Clinical Coordinator role transition to the HUB. I had no voice in this conversation, just told this was what's to happen. May 14 came, and I was told I was to remain on with the College of Nursing for another 3-6 months and be given a monthly stipend of $1,250 for May along with every additional month I remained on service with the College of Nursing. Well, the monthly stipend never happened as it was changed to a retention bonus due to moving to a non-exempt role. However, I don't feel that should have made any difference as to whether my employment status was exempt or non-exempt with regards to a monthly stipend. I was doing the work for the College of Nursing as Clinical Coordinator as if I hadn't even given notice, and everything was status quo. All while trying to get acquainted with my new role as Program Manager. July 8, communication was sent from Quinton Freeman that based on a conversation had between Dean Clark and Dr. Dunlay it was mutually agreed upon that I was to remain on with the College of Nursing through spring 2026 until the compliance role fully integrated to the HUB. At this time Dr. Dunlay became directly involved as the information stated in this communication was erroneous as no discussion had taken place with Dr. Dunlay and Dean Clark. Dr. Dunlay's response to this communication was that I would be working full-time in Graduate Medical Education effective August 1, 2025, however that was later changed to August 15, 2025, based on actual communication between Dr. Dunlay, Dean Clark, and the HUB. Not once during this whole process, was I involved in any of the conversations even though the decisions made without my input were directly impacting my workload, not to mention my overall well-being. There was never a clearcut end date to when my retainer with the College of Nursing would stop which caused frustrations, lack of concentration to learn my new role at Graduate Medical Education and anxiety/worry to when this would all be over. My emotions were placed on a roller coaster as end dates were given and then yanked away. It would have been nice to have been involved in the conversations and given my input as this was directly affecting me and not by the one's making the decisions. I tried to advocate for myself to how this arrangement was emotionally taking its toll on me with honestly no avail as it changed nothing. Additionally, if I had been asked to remain with the College of Nursing with an exact end date that would have made a huge difference and would have shown some consideration and respect for me as a person by the College of Nursing. I endured 4.5 months of being told what to do, having no voice in the matter even though trust me I was reaching out, expressing my displeasure with the situation and doing my best to advocate for myself. I tolerated a situation beyond what it should have been. The College of Nursing knew I was leaving yet made no plan, instead they strung me along with no end date in sight. And if it wasn't for Dr. Dunlay intervening, I would still be in this situation today! Where were the Creighton Jesuit values? Where was Cura Personalis (Care for the Individual Person)? I hope lessons can be learned from my experience with hopes that no one else will have to go through what I went through. Sincerely, Judith Meyer",
        "Pay. Creighton should really look at other universities to see what their program managers are making.",
        "I really enjoy working for Creighton. My new job is paying 42/hr to do Armed Security work, no weekends, holidays or nights. enjoyed my time at Creighton but the work/life balance offered by new role and almost 90% pay increase is impossible to turn down"
      ]
    },
    {
      questionId: "Q26",
      questionTitle: "Please describe what you observed",
      context: "Workplace concerns",
      responses: [
        "I have provided the documentation to HR.",
        "While I do not know if any legal matters were broken or not with my transition from the College of Nursing (CON) to Graduate Medical Education (GME) with the School of Medicine. I feel that was not handled properly or in a way that it should have been. I understand transitions were in process for the Clinical Coordinator role with the CON that affected the 4.5 month delay fully transitioning to GME but it should not have gotten to the point where the Dean of School of Medicine had to intervene to end my time with the CON. Promises were made by the CON and not held up to along with never knowing when my service with CON was going to end. A reflective letter is attached to the previous question along with being sent separately to human resources that fully outlines what happened."
      ]
    }
  ]
};

/**
 * Get verbatim comments for a given quarter date key.
 * Returns null for quarters without verbatim data.
 * @param {string} dateKey - Quarter date key (e.g., "2024-09-30")
 * @returns {Array|null} Array of question objects with responses, or null
 */
export function getExitSurveyVerbatim(dateKey) {
  return verbatimData[dateKey] || null;
}

export default verbatimData;
