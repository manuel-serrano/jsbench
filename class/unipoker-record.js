/*
 * Copyright (C) 2017 Apple Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. 
 */
"use strict";

const rnd = [0.8770995586538219, 0.7467351610524278, 0.23249549103551334,
             0.8231245166729784, 0.318460008277772, 0.2765477273038345,
             0.15513674037304556, 0.5188230101572456, 0.8788570276828749,
             0.2771601105468162, 0.9700492755370445, 0.8001550435089296,
             0.7591487382348389, 0.7128849223781772, 0.2847622862480405,
             0.3495062563333224, 0.350737326476135, 0.37827307050035947,
             0.40377484699886984, 0.7561712012422137, 0.05001545140986119,
             0.19141191672133837, 0.7972550777705643, 0.7261414251877654,
             0.49509481270569133, 0.3870731798871761, 0.3420524761742225,
             0.614596488706114, 0.06691072791205287, 0.8160151489153575,
             0.2524686736299045, 0.9440102865658748, 0.562750309502124,
             0.4849641646654178, 0.767134802773192, 0.881210317779896,
             0.7615118924349136, 0.9222715431462375, 0.4000333274714804,
             0.6403689196521272, 0.19943165322739242, 0.3700826030085248,
             0.44052396269539557, 0.9585803914622313, 0.08296752492104076,
             0.7252862489434361, 0.3080866477955536, 0.43370485139717574,
             0.10355931897813422, 0.7118614947944235, 0.18987605217372816,
             0.1535747708536567, 0.9032734115157618, 0.9871311299442924,
             0.879716196041422, 0.3983682242214532, 0.37420430936580723,
             0.2217686717499833, 0.012964712461905887, 0.4411150372778601,
             0.0377838201996795, 0.2654333860918104, 0.38512532337807365,
             0.6005341297018035, 0.7503975512228894, 0.15226012615126563,
             0.4817444474816995, 0.5119094431921418, 0.07453166883184187,
             0.8817777749531799, 0.15227836237860767, 0.2739633225248956,
             0.2518603774960434, 0.5928023250740032, 0.23254371352146552,
             0.33482790241708416, 0.3180885740174393, 0.5406303613170191,
             0.7685327538142599, 0.42164789299557354, 0.2524918556457813,
             0.9584088059879881, 0.5752226638492303, 0.15576526716154315,
             0.9455399359322805, 0.454938859424991, 0.5541334913829963,
             0.3197442448324264, 0.6767075316406356, 0.5670982038449022,
             0.7608592825759478, 0.7144913518403151, 0.8325315899367126,
             0.1459846054883602, 0.31502548154211857, 0.5829291406939408,
             0.29824473163962584, 0.796769929023818, 0.09483858342042127,
             0.372776400937129, 0.6785477035113366, 0.24711694579902893,
             0.6467397234620246, 0.9304080814730413, 0.8399192713386935,
             0.8792834369834901, 0.26523598342446425, 0.15800784489047148,
             0.41991379830050923, 0.03376873723872413, 0.579655737886045,
             0.6724056539462906, 0.9921775432267121, 0.15487840173527523,
             0.8281709211078337, 0.9377174786933313, 0.6098172611602662,
             0.38230441202516874, 0.25746172352575775, 0.28652479233524053,
             0.9494026158700709, 0.018321005636044316, 0.0010161441755556241,
             0.7819342058067835, 0.16430561112440453, 0.3160416257176742,
             0.364863346035063, 0.4625503432296917]; 
let rndi = 0;
function Mathrandom() {
   return rnd[ rndi++ % rnd.length ];
}

// @record
class CardDeck {
   #cards;
   
    constructor()
    {
        this.newDeck();
    }

    newDeck()
    {
        // Make a shallow copy of a new deck
        this.#cards = CardDeck.#newDeck.slice(0);
    }

    shuffle()
    {
        this.newDeck();

        for (let index = 52; index !== 0;) {
            // Select a random card
            let randomIndex = Math.floor(Mathrandom() * index);
            index--;

            // Swap the current card with the random card
            let tempCard = this.#cards[index];
            this.#cards[index] = this.#cards[randomIndex];
            this.#cards[randomIndex] = tempCard;
        }
    }

    dealOneCard()
    {
        return this.#cards.shift();
    }

    static cardRank(card)
    {
        // This returns a numeric value for a card.
        // Ace is highest.

        let rankOfCard = card.codePointAt(0) & 0xf;
        if (rankOfCard == 0x1) // Make Aces higher than Kings
            rankOfCard = 0xf;

        return rankOfCard;
    }

    static cardName(card)
    {      
        if (typeof(card) == "string")
            card = card.codePointAt(0);
        return CardDeck.#rankNames[card & 0xf];
    }

static #rankNames = [
    "", "Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "", "Queen", "King"
];

static #newDeck = [
    // Spades
    "\u{1f0a1}", "\u{1f0a2}",  "\u{1f0a3}",  "\u{1f0a4}",  "\u{1f0a5}",
    "\u{1f0a6}", "\u{1f0a7}",  "\u{1f0a8}",  "\u{1f0a9}",  "\u{1f0aa}",
    "\u{1f0ab}", "\u{1f0ad}",  "\u{1f0ae}",
    // Hearts
    "\u{1f0b1}", "\u{1f0b2}",  "\u{1f0b3}",  "\u{1f0b4}",  "\u{1f0b5}",
    "\u{1f0b6}", "\u{1f0b7}",  "\u{1f0b8}",  "\u{1f0b9}",  "\u{1f0ba}",
    "\u{1f0bb}", "\u{1f0bd}",  "\u{1f0be}",
    // Clubs
    "\u{1f0d1}", "\u{1f0d2}",  "\u{1f0d3}",  "\u{1f0d4}",  "\u{1f0d5}",
    "\u{1f0d6}", "\u{1f0d7}",  "\u{1f0d8}",  "\u{1f0d9}",  "\u{1f0da}",
    "\u{1f0db}", "\u{1f0dd}",  "\u{1f0de}",
    // Diamonds
    "\u{1f0c1}", "\u{1f0c2}",  "\u{1f0c3}",  "\u{1f0c4}",  "\u{1f0c5}",
    "\u{1f0c6}", "\u{1f0c7}",  "\u{1f0c8}",  "\u{1f0c9}",  "\u{1f0ca}",
    "\u{1f0cb}", "\u{1f0cd}",  "\u{1f0ce}"
];

}

// @record
class Hand {
   #cards;
   #rank = 0;
   
    constructor()
    {
       this.clear();
    }

    clear()
    {
        this.#cards = [];
        this.#rank = 0;
    }

    takeCard(card)
    {
        this.#cards.push(card);
    }

    score()
    {
        // Sort highest rank to lowest
        this.#cards.sort((a, b) => {
            return CardDeck.cardRank(b) - CardDeck.cardRank(a);
        });

        let handString = this.#cards.join("");

        let flushResult = handString.match(Hand.#FlushRegExp);
        let straightResult = handString.match(Hand.#StraightRegExp);
        let ofAKindResult = handString.match(Hand.#OfAKindRegExp);

        if (flushResult) {
            if (straightResult) {
                if (straightResult[1])
                    this.#rank = Hand.#RoyalFlush;
                else
                    this.#rank = Hand.#StraightFlush
            } else
                this.#rank = Hand.#Flush;

            this.#rank |= CardDeck.cardRank(this.#cards[0]) << 16 | CardDeck.cardRank(this.#cards[1]) << 12;
        } else if (straightResult)
            this.#rank = Hand.#Straight | CardDeck.cardRank(this.#cards[0]) << 16 | CardDeck.cardRank(this.#cards[1]) << 12;
        else if (ofAKindResult) {
            // When comparing lengths, a matched unicode character has a length of 2.
            // Therefore expected lengths are doubled, e.g a pair will have a match length of 4.
            if (ofAKindResult[0].length == 8)
                this.#rank = Hand.#FourOfAKind | CardDeck.cardRank(this.#cards[0]);
            else {
                // Found pair or three of a kind.  Check for two pair or full house.
                let firstOfAKind = ofAKindResult[0];
                let remainingCardsIndex = handString.indexOf(firstOfAKind) + firstOfAKind.length;
                let secondOfAKindResult;
                if (remainingCardsIndex <= 6
                    && (secondOfAKindResult = handString.slice(remainingCardsIndex).match(Hand.#OfAKindRegExp))) {
                    if ((firstOfAKind.length == 6 && secondOfAKindResult[0].length == 4)
                        || (firstOfAKind.length == 4 && secondOfAKindResult[0].length == 6)) {
                        let threeOfAKindCardRank;
                        let twoOfAKindCardRank;
                        if (firstOfAKind.length == 6) {
                            threeOfAKindCardRank = CardDeck.cardRank(firstOfAKind.slice(0,2));
                            twoOfAKindCardRank = CardDeck.cardRank(secondOfAKindResult[0].slice(0,2));
                        } else {
                            threeOfAKindCardRank = CardDeck.cardRank(secondOfAKindResult[0].slice(0,2));
                            twoOfAKindCardRank = CardDeck.cardRank(firstOfAKind.slice(0,2));
                        }
                        this.#rank = Hand.#FullHouse | threeOfAKindCardRank << 16 | threeOfAKindCardRank < 12 | threeOfAKindCardRank << 8 | twoOfAKindCardRank << 4 | twoOfAKindCardRank;
                    } else if (firstOfAKind.length == 4 && secondOfAKindResult[0].length == 4) {
                        let firstPairCardRank = CardDeck.cardRank(firstOfAKind.slice(0,2));
                        let SecondPairCardRank = CardDeck.cardRank(secondOfAKindResult[0].slice(0,2));
                        let otherCardRank;
                        // Due to sorting, the other card is at index 0, 4 or 8
                        if (firstOfAKind.codePointAt(0) == handString.codePointAt(0)) {
                            if (secondOfAKindResult[0].codePointAt(0) == handString.codePointAt(4))
                                otherCardRank = CardDeck.cardRank(handString.slice(8,10));
                            else
                                otherCardRank = CardDeck.cardRank(handString.slice(4,6));
                        } else
                            otherCardRank = CardDeck.cardRank(handString.slice(0,2));

                        this.#rank = Hand.#TwoPair | firstPairCardRank << 16 | firstPairCardRank << 12 | SecondPairCardRank << 8 | SecondPairCardRank << 4 | otherCardRank;
                    }
                } else {
                    let ofAKindCardRank = CardDeck.cardRank(firstOfAKind.slice(0,2));
                    let otherCardsRank = 0;
                    for (let card of this.#cards) {
                        let cardRank = CardDeck.cardRank(card);
                        if (cardRank != ofAKindCardRank)
                            otherCardsRank = (otherCardsRank << 4) | cardRank;
                    }

                    if (firstOfAKind.length == 6)
                        this.#rank = Hand.#ThreeOfAKind | ofAKindCardRank << 16 | ofAKindCardRank << 12 | ofAKindCardRank << 8 | otherCardsRank;
                    else
                        this.#rank = Hand.#Pair | ofAKindCardRank << 16 | ofAKindCardRank << 12 | otherCardsRank;
                }
            }
        } else {
            this.#rank = 0;
            for (let card of this.#cards) {
                let cardRank = CardDeck.cardRank(card);
                this.#rank = (this.#rank << 4) | cardRank;
            }
        }
    }

    get rank()
    {
        return this.#rank;
    }

    toString()
    {
        return this.#cards.join("");
    }

 static #FlushRegExp = new RegExp("([\u{1f0a1}-\u{1f0ae}]{5})|([\u{1f0b1}-\u{1f0be}]{5})|([\u{1f0c1}-\u{1f0ce}]{5})|([\u{1f0d1}-\u{1f0de}]{5})", "u");

 static #StraightRegExp = new RegExp("([\u{1f0a1}\u{1f0b1}\u{1f0d1}\u{1f0c1}][\u{1f0ae}\u{1f0be}\u{1f0de}\u{1f0ce}][\u{1f0ad}\u{1f0bd}\u{1f0dd}\u{1f0cd}][\u{1f0ab}\u{1f0bb}\u{1f0db}\u{1f0cb}][\u{1f0aa}\u{1f0ba}\u{1f0da}\u{1f0ca}])|[\u{1f0ae}\u{1f0be}\u{1f0de}\u{1f0ce}][\u{1f0ad}\u{1f0bd}\u{1f0dd}\u{1f0cd}][\u{1f0ab}\u{1f0bb}\u{1f0db}\u{1f0cb}][\u{1f0aa}\u{1f0ba}\u{1f0da}\u{1f0ca}][\u{1f0a9}\u{1f0b9}\u{1f0d9}\u{1f0c9}]|[\u{1f0ad}\u{1f0bd}\u{1f0dd}\u{1f0cd}][\u{1f0ab}\u{1f0bb}\u{1f0db}\u{1f0cb}][\u{1f0aa}\u{1f0ba}\u{1f0da}\u{1f0ca}][\u{1f0a9}\u{1f0b9}\u{1f0d9}\u{1f0c9}][\u{1f0a8}\u{1f0b8}\u{1f0d8}\u{1f0c8}]|[\u{1f0ab}\u{1f0bb}\u{1f0db}\u{1f0cb}][\u{1f0aa}\u{1f0ba}\u{1f0da}\u{1f0ca}][\u{1f0a9}\u{1f0b9}\u{1f0d9}\u{1f0c9}][\u{1f0a8}\u{1f0b8}\u{1f0d8}\u{1f0c8}][\u{1f0a7}\u{1f0b7}\u{1f0d7}\u{1f0c7}]|[\u{1f0aa}\u{1f0ba}\u{1f0da}\u{1f0ca}][\u{1f0a9}\u{1f0b9}\u{1f0d9}\u{1f0c9}][\u{1f0a8}\u{1f0b8}\u{1f0d8}\u{1f0c8}][\u{1f0a7}\u{1f0b7}\u{1f0d7}\u{1f0c7}][\u{1f0a6}\u{1f0b6}\u{1f0d6}\u{1f0c6}]|[\u{1f0a9}\u{1f0b9}\u{1f0d9}\u{1f0c9}][\u{1f0a8}\u{1f0b8}\u{1f0d8}\u{1f0c8}][\u{1f0a7}\u{1f0b7}\u{1f0d7}\u{1f0c7}][\u{1f0a6}\u{1f0b6}\u{1f0d6}\u{1f0c6}][\u{1f0a5}\u{1f0b5}\u{1f0d5}\u{1f0c5}]|[\u{1f0a8}\u{1f0b8}\u{1f0d8}\u{1f0c8}][\u{1f0a7}\u{1f0b7}\u{1f0d7}\u{1f0c7}][\u{1f0a6}\u{1f0b6}\u{1f0d6}\u{1f0c6}][\u{1f0a5}\u{1f0b5}\u{1f0d5}\u{1f0c5}][\u{1f0a4}\u{1f0b4}\u{1f0d4}\u{1f0c4}]|[\u{1f0a7}\u{1f0b7}\u{1f0d7}\u{1f0c7}][\u{1f0a6}\u{1f0b6}\u{1f0d6}\u{1f0c6}][\u{1f0a5}\u{1f0b5}\u{1f0d5}\u{1f0c5}][\u{1f0a4}\u{1f0b4}\u{1f0d4}\u{1f0c4}][\u{1f0a3}\u{1f0b3}\u{1f0d3}\u{1f0c3}]|[\u{1f0a6}\u{1f0b6}\u{1f0d6}\u{1f0c6}][\u{1f0a5}\u{1f0b5}\u{1f0d5}\u{1f0c5}][\u{1f0a4}\u{1f0b4}\u{1f0d4}\u{1f0c4}][\u{1f0a3}\u{1f0b3}\u{1f0d3}\u{1f0c3}][\u{1f0a2}\u{1f0b2}\u{1f0d2}\u{1f0c2}]|[\u{1f0a1}\u{1f0b1}\u{1f0d1}\u{1f0c1}][\u{1f0a5}\u{1f0b5}\u{1f0d5}\u{1f0c5}][\u{1f0a4}\u{1f0b4}\u{1f0d4}\u{1f0c4}][\u{1f0a3}\u{1f0b3}\u{1f0d3}\u{1f0c3}][\u{1f0a2}\u{1f0b2}\u{1f0d2}\u{1f0c2}]", "u");

 static #OfAKindRegExp = new RegExp("(?:[\u{1f0a1}\u{1f0b1}\u{1f0d1}\u{1f0c1}]{2,4})|(?:[\u{1f0ae}\u{1f0be}\u{1f0de}\u{1f0ce}]{2,4})|(?:[\u{1f0ad}\u{1f0bd}\u{1f0dd}\u{1f0cd}]{2,4})|(?:[\u{1f0ab}\u{1f0bb}\u{1f0db}\u{1f0cb}]{2,4})|(?:[\u{1f0aa}\u{1f0ba}\u{1f0da}\u{1f0ca}]{2,4})|(?:[\u{1f0a9}\u{1f0b9}\u{1f0d9}\u{1f0c9}]{2,4})|(?:[\u{1f0a8}\u{1f0b8}\u{1f0d8}\u{1f0c8}]{2,4})|(?:[\u{1f0a7}\u{1f0b7}\u{1f0d7}\u{1f0c7}]{2,4})|(?:[\u{1f0a6}\u{1f0b6}\u{1f0d6}\u{1f0c6}]{2,4})|(?:[\u{1f0a5}\u{1f0b5}\u{1f0d5}\u{1f0c5}]{2,4})|(?:[\u{1f0a4}\u{1f0b4}\u{1f0d4}\u{1f0c4}]{2,4})|(?:[\u{1f0a3}\u{1f0b3}\u{1f0d3}\u{1f0c3}]{2,4})|(?:[\u{1f0a2}\u{1f0b2}\u{1f0d2}\u{1f0c2}]{2,4})", "u");

static #RoyalFlush = 0x900000;
static #StraightFlush = 0x800000;
static #FourOfAKind = 0x700000;
static #FullHouse = 0x600000;
static #Flush = 0x500000;
static #Straight = 0x400000;
static #ThreeOfAKind = 0x300000;
static #TwoPair = 0x200000;
static #Pair = 0x100000;
}

// @record
class Player extends Hand {
   #name;
   #wins;
   #handTypeCounts;
   
    constructor(name)
    {
        super();
        this.#name = name;
        this.#wins = 0;
        this.#handTypeCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }

    scoreHand()
    {
        this.score();
        let handType = this.rank >> 20;
        this.#handTypeCounts[handType]++;
    }

    wonHand()
    {
        this.#wins++
    }

    get name()
    {
        return this.#name;
    }

    get hand()
    {
        return super.toString();
    }

    get wins()
    {
        return this.#wins;
    }

    get handTypeCounts()
    {
        return this.#handTypeCounts;
    }
}

function playHands(players)
{
    let cardDeck = new CardDeck();
    let handsPlayed = 0;
    let highestRank = 0;

    do {
        cardDeck.shuffle();

        for (let player of players)
            player.clear();

        for (let i = 0; i < 5; i++) {
            for (let player of players)
                player.takeCard(cardDeck.dealOneCard());
        }

        for (let player of players)
            player.scoreHand();

        handsPlayed++;

        highestRank = 0;

        for (let player of players) {
            if (player.rank > highestRank)
                highestRank = player.rank;
        }

        for (let player of players) {
            // We count ties as wins for each player.
            if (player.rank == highestRank)
                player.wonHand();
        }
    } while (handsPlayed < 2000);
}

// @record
class PlayerExpectation
{
   #wins;
   #handTypeCounts;
   
    constructor(wins, handTypeCounts)
    {
        this.#wins = wins;
        this.#handTypeCounts = handTypeCounts;
    }

    validate(player)
    {
        if (player.wins != this.#wins)
            throw "Expected " + player.name + " to have " + this.#wins + ", but they have " + player.wins;

        let actualHandTypeCounts = player.#handTypeCounts;
        if (this._handTypeCounts.length != actualHandTypeCounts.length)
            throw "Expected " + player.name + " to have " + this._handTypeCounts.length + " hand types, but they have " + actualHandTypeCounts.length;

        for (let handTypeIdx = 0; handTypeIdx < this._handTypeCounts.length; handTypeIdx++) {
            if (this._handTypeCounts[handTypeIdx] != actualHandTypeCounts[handTypeIdx]) {
                throw "Expected " + player.name + " to have " + this._handTypeCounts[handTypeIdx] + " " + PlayerExpectation._handTypes[handTypeIdx] + " hands, but they have " + actualHandTypeCounts[handTypeIdx];
            }

        }
    }

    static _handTypes = [
       "High Cards",
       "Pairs",
       "Two Pairs",
       "Three of a Kinds",
       "Straights",
       "Flushes",
       "Full Houses",
       "Four of a Kinds",
       "Straight Flushes",
       "Royal Flushes"
       ];
}
    
var playerExpectations = [];

playerExpectations.push(new PlayerExpectation(59864, [ 120476, 101226, 11359, 5083, 982, 456, 370, 45, 3, 0]));
playerExpectations.push(new PlayerExpectation(60020, [ 120166, 101440, 11452, 5096, 942, 496, 333, 67, 8, 0]));
playerExpectations.push(new PlayerExpectation(60065, [ 120262, 101345, 11473, 5093, 941, 472, 335, 76, 3, 0]));
playerExpectations.push(new PlayerExpectation(60064, [ 120463, 101218, 11445, 5065, 938, 446, 364, 58, 3, 0]));


// @record
class Benchmark {
   #players;
    constructor()
    {
        this.#players = [];
        this.#players.push(new Player("Player 1"));
        this.#players.push(new Player("Player 2"));
        this.#players.push(new Player("Player 3"));
        this.#players.push(new Player("Player 4"));
    }

    runIteration()
    {
        playHands(this.#players);
    }

    validate()
    {
        if (this.#players.length != playerExpectations.length)
            throw "Expect " + playerExpectations.length + ", but actually have " + this.#players.length;
/* 	for (let playerIdx = 0; playerIdx < playerExpectations.length; playerIdx++) */
/* 	       playerExpectations[playerIdx].validate(this.#players[playerIdx]); */
	return true;
    }
}


function run() {
   const b = new Benchmark();
   
   b.runIteration();
   b.validate();
}

function main( bench, n ) {
   let res = 0;
   const k = Math.round( n / 10 );
   let i = 1;
   
   console.log( bench + "(", n, ")..." );
   
   while( n-- > 0 ) {
      if( n % k === 0 ) { console.log( i++ ); }
      run();
   }

   console.log( "res=", res );
}

const N = 
   (process.argv[ 1 ] === "fprofile") 
   ? 10
   : process.argv[ 2 ] ? parseInt( process.argv[ 2 ] ) : 500;

main( "unipoker", N ); 

