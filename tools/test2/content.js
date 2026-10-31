/* ================= 640 TEST 2 CONTENT =================
   Everything the study guide teaches lives here. Source: the BUAN 640 Test 2 tutor kit
   and the posted practice test with solutions. Edit freely: the app reads these arrays.
   OBJ   learning objectives (code -> short name)
   DECKS concept decks for Learn mode; each card has f (front) and b (back, simple HTML)
   QC    quick checks for Practice and Test (a = index of the right option, o = objective codes)
*/
const OBJ={
  P1:"Sample spaces & random experiments", P2:"Valid probability assignments", P3:"Addition & complement rules",
  P4:"Mutually exclusive vs independent", P5:"Multiplication rule",
  D1:"Random variables, discrete vs continuous", D2:"Valid discrete distribution", D3:"Expected value, variance, SD",
  D4:"Binomial assumptions", D5:"Binomial probabilities",
  C1:"Continuous: P(single value) = 0", C4:"Normal table lookups", C5:"z-scores & percentiles", C6:"Normal model in business"
};

const DECKS=[
{id:"basics", title:"The building blocks", sub:"Experiments, events, random variables", cards:[
 {f:"Random experiment", b:"Any process whose result is uncertain before it happens.<ex>Selecting one car at random from a list; inspecting five units from a production line; recording tomorrow's demand.</ex>"},
 {f:"Random event", b:"A set of possible outcomes of a random experiment: a statement that turns out <b>true or false</b> once the experiment is run.<ex>\"The selected car has at least four stars.\" \"All five units pass inspection.\" \"Demand exceeds 500 units.\"</ex>"},
 {f:"Random variable", b:"A <b>rule that assigns a number</b> to each possible outcome of a random experiment. Before the experiment runs it has no particular value; it has a <b>distribution</b>, which says how probable each value is.<ex>The number of stars of the selected car; the number of defective units among five; tomorrow's demand in units.</ex>"},
 {f:"Realization", b:"The particular value the random variable takes once the experiment has run. The random variable is the rule; the realization is the number it produced this time.<ex>X = stars of a randomly selected car. The car we pick has 4 stars, so 4 is a realization of X.</ex>"},
 {f:"How do events and random variables connect?", b:"Any statement about the value of X defines an event: {X = 5}, {X ≥ 4}, {60 < X < 70}. So P(X ≥ 4) is just the probability of an event, and all the probability rules apply unchanged.<ex>{X = 4} and {X = 5} are mutually exclusive (X can't take two values at once), so their probabilities can be added.</ex>"},
 {f:"X versus x", b:"Capital <b>X</b> is the random variable (the rule). Lowercase <b>x</b> is one particular number X might take. P(X = x) reads \"the probability that X takes the value x\". In p(x) = ..., x is a placeholder you replace with a number, as in P(X = 4).<ex>Capitals near the start (A, B) usually name events; capitals near the end (X, Y, Z) name random variables; n and p are given constants; μ and σ are the mean and SD.</ex>"},
 {f:"Discrete vs continuous", b:"<b>Discrete:</b> the values can be listed (counts, ratings on a fixed scale).<br><b>Continuous:</b> any value in an interval (weight, time, a score modeled as continuous).<br>Decide by the <b>set of values X can take</b>, and give a one-sentence reason.<ex>Model answer: \"X assumes a finite number of values (specifically, 5), and therefore it is discrete.\"</ex>"},
 {f:"Why is P(X = 70) = 0 for a continuous X?", b:"For a continuous variable, probability is <b>area under the density curve over an interval</b>, and a single point has no width. P(69.5 < X < 70.5) is positive; P(X = 70) is 0.<ex>So for a normal X, P(X > 70) = P(X ≥ 70). For a binomial X, {X > 3} and {X ≥ 3} are different events with different probabilities.</ex>"}
]},
{id:"table", title:"Distribution from a table", sub:"Template 1: build it, check it, use it", cards:[
 {f:"Build a distribution from a table of counts", b:"Divide each count by the total. Show how each probability was obtained.<ex>100 cars: 0, 4, 18, 59, 19 cars with 1 to 5 stars → P(x) = 0, 0.04, 0.18, 0.59, 0.19.</ex>"},
 {f:"When is a distribution valid?", b:"Check <b>both</b> conditions:<br>1. Every probability is between 0 and 1.<br>2. The probabilities sum to 1.<ex>0.2, 0.3, 0.4, 0.2 sums to 1.1, so it is not valid, even though each value is between 0 and 1.</ex>"},
 {f:"Translate the event before computing", b:"Turn the words into values of X first. For a discrete X the boundary matters:<br>\"more than 2\" excludes 2 · \"at least 2\" includes 2<br>\"fewer than 5\" excludes 5 · \"at most 5\" includes 5<ex>P(X < 4) = P(X = 1) + P(X = 2) + P(X = 3) = 0 + 0.04 + 0.18 = 0.22</ex>"},
 {f:"Why may you add P(X = 3) and P(X = 4)?", b:"Because the events {X = 3} and {X = 4} are <b>mutually exclusive</b>: X cannot take two values at once. Not \"because the trials are independent\"; that is a common error."},
 {f:"Expected value: formula", b:"E[X] = Σ x · p(x) (not on the formula sheet, so memorize it).<ex>E[X] = 1(0) + 2(0.04) + 3(0.18) + 4(0.59) + 5(0.19) = 3.93</ex>"},
 {f:"What is the expected value?", b:"The <b>probability-weighted average</b> of the values of X: the center of the distribution. It does not have to be a value X can take.<ex>3.93 stars is not a possible rating. Like 1.9 children per family: no family has 1.9 children.</ex>"},
 {f:"Interpret E[X] (full credit)", b:"Do three things: say it is an <b>average</b>; say <b>what it is averaged over</b>; use the <b>context and units</b>.<br>• Fixed set, one drawn at random: \"An average rating of a car in this set is 3.93 stars.\"<br>• Repeated experiment: \"If this experiment were repeated infinitely many times, on average the expert would correctly identify 4.4 matches out of 5.\"<ex>Never: \"X will be 3.93\", \"3.93 is the most likely value\", \"we expect 3.93\" in the everyday sense.</ex>"},
 {f:"Interpretation: what loses points?", b:"<b>Partial:</b> \"on average, 4.4 matches\" with no hint of what the average is over.<br><b>No credit:</b> \"the expert will identify 4.4 matches\", \"is expected to get 4.4 right\", \"4.4 is the most likely number\". Each treats E[X] as a prediction of one result, and a count can't even be 4.4."},
 {f:"Variance: say it from memory", b:"Var(X) = E[(X − E[X])²]: the <b>expected value of the squared difference</b> between X and its expected value. Roughly, <b>the average squared deviation from the average</b>.<br>Compute: Var(X) = Σ (x − E[X])² · p(x)."},
 {f:"Why square the deviations?", b:"Plain deviations always average to <b>zero</b>: values above and below E[X] cancel. Squaring makes every deviation count and weighs big ones more. Price: variance is in <b>squared units</b>."},
 {f:"Standard deviation", b:"SD(X) = √Var(X). It brings the spread back to the <b>units of X</b> and describes a typical distance between X and E[X]. Show the work (a table of deviations is fine) and state the units.<ex>Var = 0.5251 → SD = √0.5251 = 0.7246 stars</ex>"},
 {f:"Variance table layout", b:"Columns: x · P(x) · x − E[X] · (x − E[X])² · P(x)(x − E[X])². Add the last column for Var(X), then take the square root.<ex>Stars: 0 + 0.1490 + 0.1557 + 0.0029 + 0.2175 = 0.5251</ex>"}
]},
{id:"binom", title:"Binomial", sub:"Template 2: recognize it, justify it, compute", cards:[
 {f:"The four binomial assumptions", b:"1. A <b>fixed number n</b> of identical trials<br>2. <b>Two outcomes</b> per trial (success / failure)<br>3. The <b>same probability p</b> of success in every trial<br>4. <b>Independent</b> trials<br>Find where the problem states each one."},
 {f:"Full-credit binomial justification", b:"Define X in words, name the structure, give the parameters:<ex>\"Let X = number of correct matches out of 5. Since this random variable can be represented as a number of successes in n identical independent trials, X ~ B(5, 0.88).\"</ex>"},
 {f:"Justification: what loses points?", b:"<b>Partial:</b> X ~ B(5, 0.88) with no reason, or the formula used with no distribution named.<br><b>No credit:</b> \"binomial because there are two outcomes\" alone, or \"because it's a probability problem\". Independence and constant p are the assumptions that usually fail in practice."},
 {f:"The binomial formula", b:"p(x) = C(n, x) · p<sup>x</sup> · (1 − p)<sup>n − x</sup>, where C(n, x) = n! / (x!(n − x)!). On the formula sheet, with E[X] = np and Var(X) = np(1 − p).<ex>P(X = 4) = 5!/(4!·1!) · 0.88⁴ · 0.12 = 5 · 0.5997 · 0.12 ≈ 0.3598</ex>"},
 {f:"Where does the formula come from?", b:"Each sequence of successes and failures is an elementary event; its probability is a product by the <b>multiplication rule</b> (the trials are independent). The <b>binomial coefficient</b> counts how many sequences give the same value of X."},
 {f:"Binomial coefficients you'll need", b:"C(5,3) = 5!/(3!·2!) = 10 (not 5 × 3).<ex>C(4,1)=4 · C(4,2)=6 · C(5,1)=5 · C(5,2)=10 · C(5,3)=10 · C(5,4)=5 · C(6,1)=6 · C(6,2)=15 · C(6,3)=20 · C(n,0)=C(n,n)=1</ex>"},
 {f:"Independent trials vs mutually exclusive values", b:"Both appear in every binomial problem, and they are not the same.<br><b>Independence</b> justifies <b>multiplying</b> across trials inside each term.<br><b>Mutual exclusivity</b> justifies <b>adding</b> P(X = 3) + P(X = 4) across values.<ex>Two mutually exclusive events with positive probability are never independent: learning one happened tells you the other didn't.</ex>"},
 {f:"\"Exactly one mistake out of 5\"", b:"If X counts <b>correct</b> identifications, one mistake means 4 correct: <b>X = 4</b>, not X = 1. Always convert failures into the count X tracks."},
 {f:"\"More than 2 but less than 5\"", b:"Both inequalities are strict: X = 3 or 4.<ex>P(2 < X < 5) = P(X = 3) + P(X = 4) = 0.0981 + 0.3598 = 0.4579</ex>"},
 {f:"\"At least 1\": the shortcut", b:"The complement of \"at least one\" is \"none\": P(X ≥ 1) = 1 − P(X = 0)."},
 {f:"Binomial expected value", b:"E[X] = np, interpreted as the average number of successes over many repetitions of the same experiment.<ex>E[X] = 5 × 0.88 = 4.4: \"if this experiment were repeated infinitely many times, on average the expert would correctly identify 4.4 matches out of 5.\"</ex>"},
 {f:"Service level and stockout risk", b:"With s units (or seats) on hand and demand X:<br><b>Service level</b> = P(X ≤ s)<br><b>Stockout risk</b> = P(X > s)<ex>6 tickets sold for 5 seats, each passenger shows with p = 0.9: overbooked means X = 6, P = 0.9⁶.</ex>"},
 {f:"Looks binomial but isn't", b:"• Sampling <b>without replacement</b> from a small group (trials not independent)<br>• <b>p changes</b> from trial to trial (big vs small clients)<br>• <b>No fixed n</b> (customers arriving in an hour, umbrellas sold in a day)<br>• Linked trials: employees of one store, members of one household"}
]},
{id:"normal", title:"Normal", sub:"Template 3: z-scores, table, percentiles", cards:[
 {f:"z-score", b:"z = (x − μ) / σ: how many standard deviations x lies above (+) or below (−) the mean. Round to two decimals for the table. Not on the formula sheet.<ex>(70 − 50)/15 = 1.33: a rating of 70 is 1.33 SDs above the mean.</ex>"},
 {f:"What the table gives", b:"The area to the <b>LEFT</b> of z, for z from 0.00 to 3.09. Not the area between 0 and z, and not the area to the right.<ex>Row 1.3, column 0.03 → P(Z < 1.33) = 0.9082</ex>"},
 {f:"Area ABOVE a value", b:"Use the complement: P(Z > z) = 1 − P(Z < z).<ex>P(X > 70) = 1 − P(Z < 1.33) = 1 − 0.9082 = 0.0918 → about 9.18% of employees rate above 70.</ex>"},
 {f:"Area BETWEEN two values", b:"Subtract the two left areas: P(a < X < b) = P(X < b) − P(X < a).<ex>P(60 < X < 70) = 0.9082 − 0.7486 = 0.1596</ex>"},
 {f:"Negative z with a positive-only table", b:"Use symmetry: P(Z < −z) = 1 − P(Z < z).<ex>P(Z < −1.33) = 1 − 0.9082 = 0.0918. And P(Z > −1.33) = P(Z < 1.33) = 0.9082.</ex>"},
 {f:"Cutoff / percentile questions", b:"1. Say which percentile: \"lowest rating in the top 10%\" = <b>90th percentile</b>.<br>2. Find the closest table probability and its z.<br>3. x = μ + zσ, with numbers.<br>4. Round in context if it must be whole.<ex>Closest to 0.9 is 0.8997 at z = 1.28 → x = 50 + 1.28 × 15 = 69.2 → 69</ex>"},
 {f:"Bottom k% cutoff", b:"The highest value in the bottom 10% is the <b>10th percentile</b>, below the mean, so z is negative. Find the z for 0.90 (1.28) and flip the sign: z = −1.28, then x = μ − 1.28σ."},
 {f:"Reorder point for a service level", b:"A 95% service level means stock covers lead-time demand 95% of the time, so the reorder point is the <b>95th percentile</b> of lead-time demand: P(demand ≤ ROP) = 0.95."},
 {f:"Not in the table? Don't interpolate", b:"Use the closest table probability and its z, and say which one you used. If two are equally close, either is fine.<ex>0.95 lies between 0.9495 (1.64) and 0.9505 (1.65): use either and say which.</ex>"},
 {f:"Common table lookups", b:"0.90 → z = 1.28 (0.8997)<br>0.95 → 1.64 or 1.65<br>0.975 → 1.96 (0.9750)<br>0.99 → 2.33 (0.9901)<br>0.80 → 0.84 (0.7995)<br>0.75 → 0.67 (0.7486)"},
 {f:"\"Above 70\" vs \"70 or above\"", b:"For a <b>normal</b> X they are the same, because P(X = 70) = 0. For a <b>binomial</b> X they are different events."},
 {f:"When does the normal model fit?", b:"\"Approximately normal\" works when nearly all the probability falls inside the possible range. Ratings 1 to 100 with μ = 50, σ = 15: the range is more than 3σ from the mean on both sides.<ex>Bad fits: waiting times, incomes, claim sizes (skewed, bounded at zero). Hold time with μ = 2, σ = 3 min gives P(X < 0) = 0.2514.</ex>"},
 {f:"Finish in context", b:"End with a sentence about the problem, not just a number.<ex>\"Approximately 9.18% of employees have a rating above 70.\"</ex>"}
]},
{id:"spot", title:"Spot the template", sub:"Recognize the structure under a new story", cards:[
 {f:"The test in one sentence", b:"<b>One written problem</b>, very similar in structure to one of the three practice problems, in a new context. Closed book, calculator only. Formula sheet and normal table provided. Graded on reasoning, justification and interpretation, not only the number."},
 {f:"Signature: Template 1 (table)", b:"A table of counts or percentages for a numerical variable with a few values; one unit drawn at random, or one period treated as random. <b>No named distribution:</b> the table is the distribution. Asks for the distribution, a range probability, E[X], SD."},
 {f:"Signature: Template 2 (binomial)", b:"A fixed number n of repeated trials, two outcomes each, the same probability every time, independent. X counts successes.<ex>Signal phrases: \"each ... independently\", \"out of n\", \"assume the same probability for every ...\"</ex>"},
 {f:"Signature: Template 3 (normal)", b:"A measurement that can take any value in an interval, stated to be (approximately) normal with a given mean and SD. Asks for proportions above, below, between, or a value cutting off a proportion."},
 {f:"Typical Template 1 stories", b:"Items per online order · cars sold per day · satisfaction ratings 1 to 5 · service calls per day · walk-in rooms per night · returns per week · credit cards per applicant"},
 {f:"Typical Template 2 stories", b:"Defectives in a sample from a large run · coupon redemptions · on-time deliveries · loan defaults · first-contact resolutions · flight no-shows (overbooking) · survey responses · offers accepted"},
 {f:"Typical Template 3 stories", b:"Package fill weights · part lengths or diameters · lead-time demand and reorder points · delivery times on a fixed route · daily line output · aptitude test scores"}
]},
{id:"grading", title:"How you're graded", sub:"What a full-credit answer shows", cards:[
 {f:"1. Define X in words first", b:"Say what it counts or measures before using it.<ex>\"Let X = number of correct matches out of 5.\"</ex>Probabilities about an X you never defined make an incomplete answer."},
 {f:"2. Translate the event into values of X", b:"\"At least 4 correct\" → X ≥ 4 → X = 4 or X = 5. Do this before computing."},
 {f:"3. Expression, numbers, result", b:"Write the expression, then substitute, then the result. A bare number is not an answer.<ex>P(X = 4) = 5!/(4!·1!) · 0.88⁴ · 0.12 = 5 · 0.5997 · 0.12 ≈ 0.3598</ex>"},
 {f:"4. Discrete or continuous, with a reason", b:"Decide by the set of values X can take, in one sentence."},
 {f:"5. Show where the distribution came from", b:"Count ÷ total for each value. If asked whether it's valid, check both: each between 0 and 1, and the sum is 1."},
 {f:"6. Justify the binomial", b:"Name the structure (successes in n identical independent trials with the same p), then X ~ B(n, p) with numbers."},
 {f:"7. Interpret E[X]", b:"Average + what it's averaged over + context and units. Never \"X will be ...\" or \"most likely\"."},
 {f:"8. SD with work and units", b:"Compute from the variance with the work shown; state it in the units of X."},
 {f:"9. Normal probabilities", b:"z with the formula shown (2 decimals), quote the table value, show how you got the area (complement, difference, or symmetry)."},
 {f:"10. Percentile / cutoff", b:"Name the percentile, quote the closest table probability and its z, compute x = μ + zσ with numbers, round in context."},
 {f:"11. Finish in context, round right", b:"Final line goes back to the story. Probabilities to 4 decimals, z to 2 decimals, unless the question says otherwise."}
]},
{id:"errors", title:"Common traps", sub:"The mistakes most students make first", cards:[
 {f:"Trap: X never defined", b:"Writing P(X ≥ 4) without saying what X is. Define it in words first."},
 {f:"Trap: wrong boundary", b:"Including 2 in \"more than 2\", excluding 4 from \"at least 4\", reading \"exactly one mistake\" as X = 1."},
 {f:"Trap: E[X] as a prediction", b:"\"Will be\" or \"most likely\". E[X] is an average over repetitions or over the set."},
 {f:"Trap: variance as plain average deviation", b:"Or as \"the square of the mean\". The plain average deviation is always zero."},
 {f:"Trap: forgetting the square root", b:"Reporting the variance as the SD, or giving the variance in the units of X."},
 {f:"Trap: binomial with no reason", b:"Or calling it binomial when trials aren't independent, p changes, or there's no fixed n."},
 {f:"Trap: adding because of independence", b:"Adding P(X = 3) + P(X = 4) is justified by <b>mutual exclusivity</b>. Independence justifies multiplying inside each term."},
 {f:"Trap: botched binomial coefficient", b:"C(5,3) is 10, not 5 × 3 = 15. Don't drop it when it isn't 1."},
 {f:"Trap: misreading the table", b:"The table gives area to the LEFT of z. Not between 0 and z, not to the right."},
 {f:"Trap: forgetting the complement", b:"Reporting P(Z < 1.33) = 0.9082 when the question asks for the area above (0.0918)."},
 {f:"Trap: cutoff left as a z-score", b:"Convert back: x = μ + zσ. Watch the sign for bottom-tail cutoffs."},
 {f:"Trap: negative z in a positive table", b:"Use symmetry, P(Z < −z) = 1 − P(Z < z)."},
 {f:"Trap: number with no story", b:"No expression, or no closing sentence in context."}
]},
{id:"formulas", title:"Formulas", sub:"What's given and what you must know", cards:[
 {f:"Given on the test", b:"P(Aᶜ) = 1 − P(A)<br>P(A or B) = P(A) + P(B) − P(A and B)<br>Mutually exclusive: P(A or B) = P(A) + P(B)<br>P(A|B) = P(A and B)/P(B)<br>Binomial p(x), E[X] = np, Var(X) = np(1 − p)<br>Standard normal table (area to the left)"},
 {f:"Memorize: expected value", b:"E[X] = Σ x · p(x)"},
 {f:"Memorize: variance and SD", b:"Var(X) = Σ (x − E[X])² · p(x)<br>SD(X) = √Var(X)"},
 {f:"Memorize: z both ways", b:"z = (x − μ)/σ<br>x = μ + zσ"},
 {f:"Memorize: tails and symmetry", b:"P(Z > z) = 1 − P(Z < z)<br>P(Z < −z) = 1 − P(Z < z)"}
]},
{id:"examples", title:"Posted practice test", sub:"The three problems with model answers", cards:[
 {f:"Stars Q1(a): 100 cars, X = stars (1 to 5). Discrete or continuous?", b:"X assumes a finite number of values (specifically, 5), and therefore it is discrete."},
 {f:"Stars Q1(b): counts 0, 4, 18, 59, 19. Distribution?", b:"We have 100 observations, so divide each count by 100:<br>x: 1, 2, 3, 4, 5<br>P(x): 0, 0.04, 0.18, 0.59, 0.19"},
 {f:"Stars Q1(c): P(X < 4)?", b:"P(X < 4) = P(X = 1) + P(X = 2) + P(X = 3) = 0 + 0.04 + 0.18 = 0.22"},
 {f:"Stars Q1(d): E[X] and interpretation", b:"E[X] = Σ x P(x) = 1×0 + 2×0.04 + 3×0.18 + 4×0.59 + 5×0.19 = 3.93<br>An average rating of a car in this set is 3.93 stars."},
 {f:"Stars Q1(e): SD of X", b:"Deviations −2.93, −1.93, −0.93, 0.07, 1.07; squared × P(x): 0, 0.1490, 0.1557, 0.0029, 0.2175.<br>Var(X) = 0.5251; SD = √0.5251 = 0.7246 stars"},
 {f:"Fingerprints Q2(a): 88% correct, 5 pairs. P(all five correct)?", b:"Let X = number of correct matches out of 5. Since X is a number of successes in n identical independent trials, X ~ B(5, 0.88).<br>P(X = 5) = 0.88⁵ = 0.5277"},
 {f:"Fingerprints Q2(b): exactly one mistake?", b:"One mistake = 4 correct.<br>P(X = 4) = 5!/(4!·1!) · 0.88⁴ · 0.12 = 5 · 0.88⁴ · 0.12 = 0.3598"},
 {f:"Fingerprints Q2(c): at least 4 correct?", b:"\"At least 4\" includes 4.<br>P(X ≥ 4) = P(X = 4) + P(X = 5) = 0.3598 + 0.5277 = 0.8875"},
 {f:"Fingerprints Q2(d): more than 2 but less than 5?", b:"P(2 < X < 5) = P(X = 3) + P(X = 4)<br>P(X = 3) = 5!/(3!·2!) · 0.88³ · 0.12² = 10 · 0.88³ · 0.12² = 0.0981<br>= 0.0981 + 0.3598 = 0.4579"},
 {f:"Fingerprints Q2(e): E[X] and interpretation", b:"E[X] = np = 5 × 0.88 = 4.4<br>If this experiment were repeated infinitely many times, on average the expert would correctly identify 4.4 matches out of 5."},
 {f:"Ratings Q3(a): N(50, 15). Lowest \"exemplary\" (top 10%) rating?", b:"Top 10% → 90th percentile. Closest table probability to 0.9 is 0.8997 at z = 1.28.<br>x = μ + zσ = 50 + 1.28 × 15 = 69.2, about 69 if whole numbers."},
 {f:"Ratings Q3(b): % above 70?", b:"z = (70 − 50)/15 = 1.33; table: 0.9082.<br>P(X > 70) = 1 − P(Z < 1.33) = 1 − 0.9082 = 0.0918<br>About 9.18% of employees rate above 70."},
 {f:"Ratings Q3(c): % between 60 and 70?", b:"P(X < 70) = 0.9082; z = (60 − 50)/15 = 0.67 → 0.7486.<br>P(60 < X < 70) = 0.9082 − 0.7486 = 0.1596, about 16% of employees."}
]}
];

/* Quick checks. q = question, c = choices, a = right index, e = why, o = objectives.
   Items 1-30 are the tutor kit's fixed bank; the rest are drill scenarios in the same style. */
const QC=[
 {q:"A = \"an order ships late\". X = \"number of late orders among the next 10 orders\". Which is correct?", c:["Both are random events","A is a random event and X is a random variable","A is a random variable and X is a random event","Both are random variables"], a:1, e:"A is a statement that will be true or false; X is a number assigned to the outcome.", o:["D1"]},
 {q:"In P(X = x), the lowercase x is:", c:["The random variable","A particular value that X can take","The expected value of X","A probability"], a:1, e:"Capital X is the random variable; lowercase x is a placeholder for one of its possible values.", o:["D1"]},
 {q:"A car is selected at random and has 4 stars. The number 4 is:", c:["The random variable","A realization of X","The expected value of X","A random event"], a:1, e:"The random variable is the rule; 4 is the value it produced this time.", o:["D1"]},
 {q:"Which of these is a random event?", c:["X","{X ≥ 4}","E[X]","x"], a:1, e:"Any statement about the value of X defines an event.", o:["P1","D1"]},
 {q:"X = customers who enter a store in an hour; Y = time between two arrivals. These are:", c:["Both discrete","X discrete, Y continuous","X continuous, Y discrete","Both continuous"], a:1, e:"Counts can be listed; a time can take any value in an interval.", o:["D1"]},
 {q:"x = 0, 1, 2, 3 with probabilities 0.2, 0.3, 0.4, 0.2. Valid distribution?", c:["Yes, every probability is between 0 and 1","No, the probabilities sum to 1.1","No, one probability is negative","Yes, there are four values"], a:1, e:"Both conditions must hold, and the sum fails.", o:["D2","P2"]},
 {q:"X = defective units in a sample of 6. \"At most 2 defective\" is:", c:["X < 2","X ≤ 2","X ≥ 2","X = 2"], a:1, e:"\"At most\" includes the boundary.", o:["D5"]},
 {q:"Same X. \"More than 2 but fewer than 5\" is:", c:["X = 2, 3, 4, 5","X = 3, 4","X = 2, 3, 4","X = 3, 4, 5"], a:1, e:"Both inequalities are strict for a discrete X.", o:["D5"]},
 {q:"X = correct identifications out of 5. \"Exactly one mistake\" is:", c:["X = 1","X = 4","X ≤ 1","X ≥ 4"], a:1, e:"One mistake out of five leaves four correct.", o:["D5"]},
 {q:"Why may P(X = 3) and P(X = 4) be added?", c:["Because the trials are independent","Because {X = 3} and {X = 4} are mutually exclusive","Because X is binomial","Because both use n = 5"], a:1, e:"X can't take two values at once. Independence justifies multiplying across trials inside each term; mutual exclusivity justifies adding across values.", o:["P3","P4"]},
 {q:"Why is P(all five correct) = 0.88⁵?", c:["The addition rule","The multiplication rule for independent trials","The complement rule","The trials are mutually exclusive"], a:1, e:"Independent trials: the probability of the whole sequence is the product.", o:["P5"]},
 {q:"Which situation is NOT binomial?", c:["6 calls, each independently resolved on first contact with p = 0.7; X = number resolved","4 cards dealt from one deck; X = number of hearts","10 independent loan applicants, each defaulting with p = 0.05; X = defaults","5 independent shipments, each on time with p = 0.9; X = number on time"], a:1, e:"Dealing without replacement changes the probability of a heart from card to card, so the trials are neither independent nor identical.", o:["D4"]},
 {q:"X = number of umbrellas a store sells in one day. Is X binomial?", c:["Yes, because it is a count","No, because there is no fixed number of trials","Yes, with n = number of customers","No, because X is continuous"], a:1, e:"A binomial count needs a fixed n set in advance.", o:["D4"]},
 {q:"A rep calls 5 clients: two large (buy with p = 0.6) and three small (p = 0.2). Is the number of sales binomial?", c:["Yes, n = 5","No, the probability of success is not the same in every trial","Yes, with p = 0.4","No, because there are two outcomes"], a:1, e:"Constant p is one of the four assumptions, and it fails here.", o:["D4"]},
 {q:"E[X] = 4.4 correct matches out of 5. Which is the correct interpretation?", c:["The expert will identify 4.4 matches","4.4 is the most likely number of matches","Over many repetitions of the five-pair test, the expert would correctly identify 4.4 matches on average","There is a 4.4% chance of a correct match"], a:2, e:"An expected value is an average over repetitions, not a prediction of one result.", o:["D3"]},
 {q:"The variance of X is:", c:["The average deviation of X from its expected value","The expected value of the squared deviation of X from its expected value","The square of the expected value","The largest value minus the smallest"], a:1, e:"Roughly, the average squared deviation from the average. The first option is always zero, because deviations cancel.", o:["D3"]},
 {q:"X is measured in dollars. The variance of X is measured in:", c:["Dollars","Dollars squared","No units","Percent"], a:1, e:"That's why the SD, in dollars, is usually reported.", o:["D3"]},
 {q:"X is continuous. P(X = 70) is:", c:["The height of the density curve at 70","0","Small but positive","Undefined"], a:1, e:"Probability for a continuous variable is area over an interval, and a single point has no width.", o:["C1"]},
 {q:"X is normal. How do P(X > 70) and P(X ≥ 70) compare?", c:["They differ by P(X = 70), which is positive","They are equal","Equal only if μ = 70","P(X ≥ 70) is always larger by 0.5"], a:1, e:"P(X = 70) = 0. For a binomial X, P(X > 3) and P(X ≥ 3) differ.", o:["C1"]},
 {q:"A rating of 70 has z = 1.33. This means:", c:["The rating is 1.33 points above the mean","The rating is 1.33 standard deviations above the mean","The rating is 133% of the mean","The probability of a rating of 70 is 1.33"], a:1, e:"A z-score counts standard deviations from the mean.", o:["C5"]},
 {q:"The table gives 0.9082 for z = 1.33. What is P(Z > 1.33)?", c:["0.9082","0.0918","0.4082","1.33"], a:1, e:"The table gives the area to the left, so the area to the right is its complement.", o:["C4","P3"]},
 {q:"The table lists only positive z. What is P(Z < −1.33)?", c:["−0.9082","0.0918","0.9082","Can't be found from this table"], a:1, e:"By symmetry, the area left of −1.33 equals the area right of 1.33.", o:["C4"]},
 {q:"\"The lowest rating that still puts an employee in the top 10%\" asks for:", c:["P(X > 10)","The 90th percentile of X","The 10th percentile of X","μ + 10%"], a:1, e:"Ten percent lie above it, so ninety percent lie below it.", o:["C5"]},
 {q:"Lead-time demand is normal. A manager wants a 95% service level. The reorder point is:", c:["The 95th percentile of lead-time demand","The 5th percentile","μ + 0.95","μ × 0.95"], a:0, e:"Then P(demand ≤ reorder point) = 0.95.", o:["C5","C6"]},
 {q:"A store holds s units and demand is X. The stockout risk is:", c:["P(X ≤ s)","P(X > s)","P(X = s)","E[X] − s"], a:1, e:"A stockout happens when demand exceeds what's on hand; the service level is P(X ≤ s).", o:["D5","C6"]},
 {q:"X ~ B(6, 0.1). The quickest way to find P(X ≥ 1) is:", c:["Add P(X = 1) through P(X = 6)","1 − P(X = 0)","P(X = 1)","6 × 0.1"], a:1, e:"The complement of \"at least one\" is \"none\".", o:["P3","D5"]},
 {q:"An airline sells 6 tickets for 5 seats; each passenger independently shows up with p = 0.9. Which template fits \"more passengers show up than there are seats\"?", c:["Distribution from a table","Binomial, P(X = 6)","Normal","None of the three"], a:1, e:"Six identical, independent trials with constant p; more than 5 out of 6 means all 6.", o:["D4","D5"]},
 {q:"A bakery recorded wedding cakes sold per week: 0 in 6 weeks, 1 in 18, 2 in 20, 3 in 8. Which template fits?", c:["Distribution from a table","Binomial","Normal","None of the three"], a:0, e:"The frequency table is the distribution; there is no fixed number of trials.", o:["D1","D2"]},
 {q:"Cereal fill weights are approximately normal, mean 500 g, SD 4 g. Which template fits \"what proportion weigh less than 492 g\"?", c:["Distribution from a table","Binomial","Normal","None of the three"], a:2, e:"A continuous measurement stated to be normal.", o:["C6"]},
 {q:"A manager models hold times as normal with mean 2 min and SD 3 min. What's wrong?", c:["Nothing","It puts substantial probability on negative waiting times, so it doesn't fit","Waiting times are discrete","The SD must be smaller than 1"], a:1, e:"Under that model P(X < 0) = P(Z < −0.67) = 0.2514. Matching the model to the situation is part of applying it.", o:["C6"]},
 /* drill scenarios */
 {q:"An inspector draws 4 parts, without replacement, from a batch of 10 that contains 3 defectives. X = defectives drawn. Binomial?", c:["Yes, X ~ B(4, 0.3)","No: drawing without replacement from a small batch makes the trials dependent","Yes, because each part is defective or not","No, because X is continuous"], a:1, e:"After each draw the chance of a defective changes. A near miss: it looks binomial but independence and constant p fail.", o:["D4"]},
 {q:"A hotel logs walk-in rooms booked on each of the last 100 nights (0 rooms on 12 nights, 1 on 30, ...). X = walk-in rooms booked on a night. Which template?", c:["Distribution from a table","Binomial","Normal","None of the three"], a:0, e:"Historical frequencies used as probabilities: the table is the distribution.", o:["D1","D2"]},
 {q:"Each of 5 independent job candidates accepts an offer with probability 0.7. X = acceptances. What is the model?", c:["X ~ B(5, 0.7)","X ~ B(0.7, 5)","Normal with μ = 3.5","Distribution from a table"], a:0, e:"Successes in n = 5 identical independent trials with p = 0.7: write X ~ B(n, p) = B(5, 0.7).", o:["D4"]},
 {q:"X = number of customers who arrive at a bank in one hour. Which assumption makes this NOT binomial?", c:["Two outcomes per trial","There is no fixed number of trials","p is too small","X is continuous"], a:1, e:"Arrivals in an hour have no n set in advance.", o:["D4"]},
 {q:"Invoice amounts at a firm are strongly right-skewed with mean $400 and SD $500. A colleague proposes a normal model. Your verdict?", c:["Fine, any variable with a mean and SD is normal","Poor fit: amounts can't be negative and are skewed, but the normal would put lots of probability below $0","Fine if you round to whole dollars","Use binomial instead"], a:1, e:"P(X < 0) = P(Z < −0.8) = 0.2119 under that model. The normal fits roughly symmetric quantities.", o:["C6"]},
 {q:"Delivery time on a fixed route is approximately normal. Is X = delivery time discrete or continuous?", c:["Discrete, because we record whole minutes","Continuous, because a time can take any value in an interval","Discrete, because there are finitely many deliveries","Neither"], a:1, e:"Decide by the set of values X can take; time is continuous.", o:["D1"]},
 {q:"Survey: 8 employees of the same store are asked whether they're satisfied, each with probability 0.6. Why might X = satisfied employees not be binomial?", c:["n is too small","Employees of one store tend to answer alike, so the trials may not be independent","Satisfied is not an outcome","p must be 0.5"], a:1, e:"Linked trials (same store, same household) break independence.", o:["D4"]},
 {q:"X ~ B(5, 0.8). Which expression is P(X = 3)?", c:["5 × 3 × 0.8³ × 0.2²","10 × 0.8³ × 0.2²","0.8³ × 0.2²","10 × 0.8² × 0.2³"], a:1, e:"C(5,3) = 5!/(3!·2!) = 10, times p³ for 3 successes and (1 − p)² for 2 failures.", o:["D5"]},
 {q:"Which full answer earns full credit for the binomial model?", c:["\"It's binomial because each pair is right or wrong.\"","\"X ~ B(5, 0.88).\"","\"Let X = correct matches out of 5. X is the number of successes in 5 identical independent trials, so X ~ B(5, 0.88).\"","\"It's a probability problem, so binomial.\""], a:2, e:"Define X, name the structure, give the parameters. Two outcomes alone is only one assumption.", o:["D4"]},
 {q:"\"The highest score that is still in the bottom 20%\" asks for:", c:["The 80th percentile","The 20th percentile","P(X < 20)","μ − 20"], a:1, e:"Twenty percent lie below it. Its z is negative: −0.84.", o:["C5"]},
 {q:"P(Z < z) = 0.9082 at z = 1.33. What is P(Z > −1.33)?", c:["0.0918","0.9082","0.4082","1.8164"], a:1, e:"By symmetry, the area right of −1.33 equals the area left of 1.33.", o:["C4"]},
 {q:"E[X] = 2.35 items per order for one order drawn at random from 200. Which interpretation is complete?", c:["\"On average, 2.35 items.\"","\"The order will have 2.35 items.\"","\"An average number of items in an order in this set of 200 orders is 2.35.\"","\"2.35 is the most likely number of items.\""], a:2, e:"Average, what it's over (the 200 orders), context and units. The first option is partial: an average of what?", o:["D3"]}
];

/* The standard normal table from the test: area to the LEFT of z, rows 0.0 to 3.0, columns .00 to .09 */
const ZT=[
[.5000,.5040,.5080,.5120,.5160,.5199,.5239,.5279,.5319,.5359],[.5398,.5438,.5478,.5517,.5557,.5596,.5636,.5675,.5714,.5753],
[.5793,.5832,.5871,.5910,.5948,.5987,.6026,.6064,.6103,.6141],[.6179,.6217,.6255,.6293,.6331,.6368,.6406,.6443,.6480,.6517],
[.6554,.6591,.6628,.6664,.6700,.6736,.6772,.6808,.6844,.6879],[.6915,.6950,.6985,.7019,.7054,.7088,.7123,.7157,.7190,.7224],
[.7257,.7291,.7324,.7357,.7389,.7422,.7454,.7486,.7517,.7549],[.7580,.7611,.7642,.7673,.7704,.7734,.7764,.7794,.7823,.7852],
[.7881,.7910,.7939,.7967,.7995,.8023,.8051,.8078,.8106,.8133],[.8159,.8186,.8212,.8238,.8264,.8289,.8315,.8340,.8365,.8389],
[.8413,.8438,.8461,.8485,.8508,.8531,.8554,.8577,.8599,.8621],[.8643,.8665,.8686,.8708,.8729,.8749,.8770,.8790,.8810,.8830],
[.8849,.8869,.8888,.8907,.8925,.8944,.8962,.8980,.8997,.9015],[.9032,.9049,.9066,.9082,.9099,.9115,.9131,.9147,.9162,.9177],
[.9192,.9207,.9222,.9236,.9251,.9265,.9279,.9292,.9306,.9319],[.9332,.9345,.9357,.9370,.9382,.9394,.9406,.9418,.9429,.9441],
[.9452,.9463,.9474,.9484,.9495,.9505,.9515,.9525,.9535,.9545],[.9554,.9564,.9573,.9582,.9591,.9599,.9608,.9616,.9625,.9633],
[.9641,.9649,.9656,.9664,.9671,.9678,.9686,.9693,.9699,.9706],[.9713,.9719,.9726,.9732,.9738,.9744,.9750,.9756,.9761,.9767],
[.9772,.9778,.9783,.9788,.9793,.9798,.9803,.9808,.9812,.9817],[.9821,.9826,.9830,.9834,.9838,.9842,.9846,.9850,.9854,.9857],
[.9861,.9864,.9868,.9871,.9875,.9878,.9881,.9884,.9887,.9890],[.9893,.9896,.9898,.9901,.9904,.9906,.9909,.9911,.9913,.9916],
[.9918,.9920,.9922,.9925,.9927,.9929,.9931,.9932,.9934,.9936],[.9938,.9940,.9941,.9943,.9945,.9946,.9948,.9949,.9951,.9952],
[.9953,.9955,.9956,.9957,.9959,.9960,.9961,.9962,.9963,.9964],[.9965,.9966,.9967,.9968,.9969,.9970,.9971,.9972,.9973,.9974],
[.9974,.9975,.9976,.9977,.9977,.9978,.9979,.9979,.9980,.9981],[.9981,.9982,.9982,.9983,.9984,.9984,.9985,.9985,.9986,.9986],
[.9987,.9987,.9987,.9988,.9988,.9989,.9989,.9989,.9990,.9990]];

/* "Explain it simply": a plain-English version of each card, in the same order as DECKS.
   Shown when you tap the lightbulb on a card. null = no simpler version needed. */
const SIMPLE={
basics:[
 "Anything where you don't know the result until it happens. Like flipping a coin, or waiting to see how many customers walk in today.<ex>Rolling a die is a random experiment. You know it will be 1 to 6, but not which.</ex>",
 "A yes/no statement about the result. After the experiment, it either happened or it didn't.<ex>Roll a die. \"I rolled an even number\" is an event: it's true for 2, 4, 6 and false for 1, 3, 5.</ex>",
 "A way of turning each result into a number. It's the question \"how many?\" or \"how much?\" you ask about the experiment.<ex>Flip 3 coins. X = number of heads. Results like HTH become the number 2.</ex>",
 "The actual number you got this time. X is the question; the realization is today's answer.<ex>X = customers who walk in today. Today 37 came in, so 37 is the realization.</ex>",
 "Any statement like \"X is at least 4\" is a yes/no event, so you can find its probability with normal probability rules.<ex>X = goals in a game. \"X = 0\" (a shutout) and \"X ≥ 3\" (a big game) are both events.</ex>",
 "Big X = the question (\"how many sales today?\"). Small x = a specific possible answer (like 3). P(X = 3) means \"chance the answer turns out to be 3\".<ex>Think of X as a blank on a form and x as what might get written in it.</ex>",
 "Can you count the possible values (0, 1, 2, ...)? Discrete. Could it be any number in a range, with decimals forever (2.3817... seconds)? Continuous.<ex>Number of texts you get today: discrete. How long your commute takes: continuous.</ex>",
 "With continuous things, \"exactly\" is infinitely precise. The chance someone is exactly 70.000000... inches tall is zero; there's only a chance of being in a range, like 69.5 to 70.5.<ex>That's why for a normal variable, \"above 70\" and \"70 or more\" give the same answer.</ex>"
],
table:[
 "Probability = how many had that value ÷ how many there are in total.<ex>20 of 100 students got an A, so P(A) = 20/100 = 0.20.</ex>",
 "Two checks: no probability below 0 or above 1, and they all add up to exactly 1 (something has to happen).<ex>Weather: 0.5 sun, 0.3 cloud, 0.3 rain adds to 1.1. Impossible, so it's not valid.</ex>",
 "Before doing math, write which numbers count. \"Fewer than 4\" means 1, 2, 3 (not 4). \"At least 4\" means 4, 5 (4 counts).<ex>\"At least 18 to vote\": 18 counts. \"Over 18\": 18 doesn't.</ex>",
 "X can't be 3 and 4 at the same time, so \"3 or 4\" has no overlap, and you just add the chances.<ex>A die can't land on 2 and 5 at once, so P(2 or 5) = 1/6 + 1/6.</ex>",
 "Multiply each value by its probability, then add them all up. It's a weighted average.<ex>A game pays $10 with chance 0.2 and $0 with chance 0.8: E = 10(0.2) + 0(0.8) = $2.</ex>",
 "It's the long-run average, not a value you'll actually see.<ex>The average family has 1.9 kids. No family has 1.9 kids, but the average still makes sense.</ex>",
 "Say three things: (1) it's an average, (2) average over what (this set of cars, or many repeats), (3) the units.<ex>\"An average rating of a car in this set is 3.93 stars.\" Average ✓, over this set ✓, stars ✓.</ex>",
 "Saying \"on average 4.4\" without saying over what loses some points. Saying it \"will be\" 4.4 or \"most likely\" 4.4 loses all of them.<ex>You can't get 4.4 fingerprints right. That's the giveaway that E[X] isn't a prediction.</ex>",
 "Variance measures how spread out the values are: how far from the average they typically land, squared.<ex>Two classes both average 75. Class A: everyone got 73 to 77 (small variance). Class B: scores from 40 to 100 (big variance).</ex>",
 "If you just averaged \"how far above or below\", the pluses and minuses cancel to zero every time. Squaring makes them all positive.<ex>Scores of 70 and 80 around an average of 75: deviations −5 and +5 add to 0. Squared: 25 + 25 = 50.</ex>",
 "Variance is in squared units (stars²), which is weird. The square root puts it back in normal units.<ex>SD = 0.72 stars means a typical car is about 0.72 stars away from the 3.93 average.</ex>",
 "Make a table, one row per value: subtract the average, square it, multiply by its probability. Add the last column. Square-root at the end.<ex>Columns: x · P(x) · x − E · (x − E)² · P(x)(x − E)²</ex>"
],
binom:[
 "Binomial = repeat the same yes/no thing a set number of times, same odds each time, and no attempt affects another.<ex>Shoot 5 free throws, 70% each, misses don't affect the next shot: binomial.</ex>",
 "Say what X counts, say why it's binomial (n identical, independent trials, same chance), then write B(n, p).<ex>\"X = free throws made out of 5. Number of successes in 5 identical independent trials, so X ~ B(5, 0.7).\"</ex>",
 "\"It's binomial\" with no reason only gets partial credit. \"Two outcomes\" alone isn't enough, because independence and same-chance are what usually break.",
 "The formula: (how many arrangements) × (chance of a success)^(successes) × (chance of failure)^(failures).<ex>2 heads in 3 flips: 3 arrangements (HHT, HTH, THH) × 0.5² × 0.5¹ = 0.375.</ex>",
 "One specific order (like HHT) has probability p × p × (1 − p). The coefficient counts how many orders give the same total.<ex>Getting exactly 1 six in 3 rolls can happen 3 ways: first, second or third roll.</ex>",
 "C(n, x) = how many ways to choose which x trials are the successes. Use n!/(x!(n − x)!).<ex>C(5,2): 5!/(2!·3!) = 120/(2·6) = 10. Not 5 × 2.</ex>",
 "Independent: one trial doesn't affect another (so multiply). Mutually exclusive: two things can't both happen (so add).<ex>Two coin flips are independent. \"X = 3\" and \"X = 4\" are mutually exclusive. Different ideas, both used here.</ex>",
 "Always count what X counts. If X counts correct ones and there was 1 mistake out of 5, then 4 were correct.<ex>Out of 5 penalty kicks, \"exactly one miss\" = 4 goals.</ex>",
 "\"More than 2\" doesn't include 2. \"Less than 5\" doesn't include 5. So only 3 and 4 count.<ex>Ages \"over 12 and under 15\": 13 and 14.</ex>",
 "\"At least one\" is the opposite of \"none\". So compute the chance of none and subtract from 1.<ex>Chance at least one of 4 texts gets a reply = 1 − (chance none do).</ex>",
 "E[X] = n × p. Read it as the average if you repeated the whole thing over and over.<ex>Flip 10 coins: E = 10 × 0.5 = 5 heads on average, over many sets of 10 flips.</ex>",
 "Service level = chance you have enough. Stockout risk = chance demand is more than you have.<ex>8 seats, 9 tickets sold: overbooked only if all 9 show up, P(X = 9).</ex>",
 "If the odds change between tries, or there's no fixed number of tries, it's not binomial.<ex>Drawing 3 cards from a deck without putting them back: the odds shift each draw. Not binomial.</ex>"
],
normal:[
 "z tells you how many standard deviations away from average something is. Positive = above, negative = below.<ex>Average height 66 in, SD 3. Someone 72 in tall: z = (72 − 66)/3 = 2, two SDs above average.</ex>",
 "Every number in the table is the share of the bell curve to the LEFT of your z (below it).<ex>z = 0 → 0.5000: half the curve is below the average.</ex>",
 "Table gives \"below\". For \"above\", do 1 minus the table number.<ex>If 90.82% are below, then 100% − 90.82% = 9.18% are above.</ex>",
 "Between two values = (share below the bigger one) − (share below the smaller one).<ex>Below 70: 90.82%. Below 60: 74.86%. Between: 15.96%.</ex>",
 "The bell curve is a mirror. The share below −1.33 is the same as the share above +1.33.<ex>P(Z < −1.33) = 1 − 0.9082 = 0.0918.</ex>",
 "Here you're given a percentage and asked for a value. Go backwards: find the % inside the table, read off z, then x = average + z × SD.<ex>Top 10% means 90% are below → find 0.90 in the table → z = 1.28 → x = 50 + 1.28 × 15 = 69.2.</ex>",
 "For a bottom cutoff, your answer is below average, so z is negative.<ex>Bottom 10%: z = −1.28. x = 50 − 1.28 × 15 = 30.8.</ex>",
 "Service level 95% = enough stock 95% of the time = the value with 95% of demand below it.<ex>So the reorder point is the 95th percentile of demand.</ex>",
 "If the exact number isn't in the table, use the closest one. No in-between math needed.<ex>0.95 is between 0.9495 and 0.9505. Pick either z (1.64 or 1.65) and say which.</ex>",
 "Memorize these and you'll save time on cutoff questions.<ex>Top 10% → 1.28 · top 5% → 1.64 or 1.65 · top 2.5% → 1.96 · top 1% → 2.33</ex>",
 "For smooth (continuous) things, landing on one exact number has zero chance, so \"above\" and \"at or above\" are the same.<ex>For counts (binomial), \"more than 3\" and \"at least 3\" are different.</ex>",
 "The bell curve only makes sense if nearly everything fits in the possible range. Waiting times can't go below 0 and are lopsided, so a bell curve fits badly.<ex>Hold time mean 2 min, SD 3: a bell curve would say 25% of calls have negative wait times. Nonsense.</ex>",
 "Your final line should be a sentence a manager could read.<ex>\"About 9.18% of employees rate above 70.\" Not just \"0.0918\".</ex>"
],
spot:[
 "You'll get one problem that looks like one of the 3 practice problems, just with a different story. Your job is to spot which one it is.",
 "If you see a table of counts and \"pick one at random\", it's Template 1.<ex>\"Here's how many cars were sold each day...\"</ex>",
 "If you see \"n tries, same chance each time, independent\" and you're counting successes, it's Template 2.<ex>\"Each of 6 customers independently buys with probability 0.3...\"</ex>",
 "If you see \"approximately normal, mean ..., standard deviation ...\", it's Template 3.<ex>\"Box weights are normal with mean 500 g and SD 4 g...\"</ex>",
 "Stories about counts recorded in a table: orders, sales per day, ratings, calls, returns.",
 "Stories about a fixed number of independent yes/no tries: defectives, coupons, deliveries, no-shows.",
 "Stories about measurements: weights, lengths, times, test scores, demand."
],
grading:[
 "Before any math, write one line: \"Let X = ...\" with what it counts.<ex>\"Let X = number of defective units out of 6.\"</ex>",
 "Turn the words into which X values count before calculating.<ex>\"At least 4 out of 5\" → X = 4 or 5.</ex>",
 "Show the formula, then the numbers plugged in, then the answer. A number alone gets little credit.",
 "One sentence: discrete because it can only be a few listed values (or continuous because it can be anything in a range).",
 "Show the division, like 18/100 = 0.18, for each value.",
 "One sentence naming the four conditions, then X ~ B(n, p).",
 "\"An average ... over ... in units\". Never \"will be\".",
 "Show the table, the variance, then the square root, with units.",
 "z with the formula shown, the table number, then how you got the final area.",
 "Name the percentile, the table number and z, then x = μ + zσ.",
 "End with a sentence about the real situation, and round probabilities to 4 decimals."
],
errors:[
 "Always start with \"Let X = ...\". It's the easiest point to grab.",
 "Read the words slowly. \"At least\" includes the number; \"more than\" doesn't. \"One mistake\" means one fewer correct.",
 "The average is not a promise. You can't sell 2.35 cars.",
 "Variance squares the distances. Without squaring, they cancel to zero.",
 "Last step for SD: square root! Variance in stars² isn't the SD.",
 "Always say why it's binomial. And check the four conditions really hold.",
 "Adding is allowed because the outcomes can't overlap, not because of independence.",
 "C(5,3) = 10. Write out the factorials if unsure: 5!/(3!·2!) = 120/12.",
 "The table is always \"below z\" (to the left).",
 "If the question says \"above\", you need 1 − table value.",
 "A cutoff answer is a value like 69.2, not a z like 1.28. Convert back.",
 "Negative z: use 1 − table value of the positive z.",
 "Finish every part with a sentence about the story."
],
formulas:[
 "You'll see these on the sheet, so don't waste time memorizing them. Do know when to use each.",
 "Average = each value × its chance, all added up.",
 "Spread = each squared distance from the average × its chance, added up. Square root for SD.",
 "z = how many SDs away. x = average + z SDs.",
 "Above = 1 − below. Negative z = mirror of positive z."
],
examples:[
 "Stars can only be 1, 2, 3, 4 or 5, a short list, so discrete.",
 "Each count ÷ 100 cars. The five numbers add to 1.",
 "\"Less than 4\" stars means 1, 2 or 3. Add those three probabilities.",
 "Weighted average of the stars. 3.93 isn't a real rating, which is exactly why it's an average, not a prediction.",
 "Distances from 3.93, squared, weighted, added: 0.5251. Square root: 0.7246 stars.",
 "Five identical independent tries at 88% each. All five right: 0.88 × 0.88 × 0.88 × 0.88 × 0.88.",
 "One mistake = four right. There are 5 places the mistake could be, so the coefficient is 5.",
 "\"At least 4\" = 4 or 5 right. Add the two probabilities you already have.",
 "\"More than 2, less than 5\" = 3 or 4 right. Compute P(3) and add P(4).",
 "5 tries × 88% = 4.4 right on average, if you ran this five-pair test over and over.",
 "Top 10% → 90% below → z = 1.28 → 50 + 1.28 × 15 = 69.2.",
 "70 is 1.33 SDs above average. 90.82% are below that, so 9.18% are above.",
 "Below 70 minus below 60: 0.9082 − 0.7486 = 0.1596, about 16%."
]
};
