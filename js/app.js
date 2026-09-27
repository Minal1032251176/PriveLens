// ============================================================
// PRIVYLENS
// CONTEXT-AWARE PRIVACY POLICY ANALYZER
// FINAL APP.JS REPLACEMENT
// ============================================================


// ============================================================
// PDF.JS
// ============================================================

import * as pdfjsLib from
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/pdf.min.mjs";


pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/6.3.289/pdf.worker.min.mjs";


// ============================================================
// PAGE LOADED
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    const policyFile =
        document.getElementById("policyFile");

    const fileName =
        document.getElementById("fileName");

    const policyText =
        document.getElementById("policyText");

    const clearButton =
        document.getElementById("clearButton");

    const analyzeButton =
        document.getElementById("analyzeButton");

    const analyzeAnotherButton =
        document.getElementById("analyzeAnotherButton");


    // ========================================================
    // PDF SELECTION
    // ========================================================

    if (policyFile) {

        policyFile.addEventListener(
            "change",
            async function () {

                if (policyFile.files.length === 0) {
                    return;
                }

                const selectedFile =
                    policyFile.files[0];


                if (
                    selectedFile.type !==
                    "application/pdf"
                ) {

                    showStatus(
                        "Please select a PDF file.",
                        "error"
                    );

                    policyFile.value = "";

                    return;
                }


                if (fileName) {

                    fileName.textContent =
                        "Selected: " +
                        selectedFile.name;

                }


                await extractPDFText(
                    selectedFile
                );

            }
        );

    }


    // ========================================================
    // TEXT COUNTER
    // ========================================================

    if (policyText) {

        policyText.addEventListener(
            "input",
            updateCharacterCount
        );

    }


    // ========================================================
    // CLEAR
    // ========================================================

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearAll
        );

    }


    // ========================================================
    // ANALYZE
    // ========================================================

    if (analyzeButton) {

        analyzeButton.addEventListener(
            "click",
            analyzePolicy
        );

    }


    // ========================================================
    // ANALYZE ANOTHER
    // ========================================================

    if (analyzeAnotherButton) {

        analyzeAnotherButton.addEventListener(
            "click",
            function () {

                clearAll();

                const report =
                    document.getElementById(
                        "reportSection"
                    );

                if (report) {

                    report.style.display =
                        "none";

                }

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }

});


// ============================================================
// PDF TEXT EXTRACTION
// ============================================================

async function extractPDFText(file) {

    const policyText =
        document.getElementById("policyText");


    showStatus(
        "Reading your PDF locally...",
        "success"
    );


    try {

        const arrayBuffer =
            await file.arrayBuffer();


        const typedArray =
            new Uint8Array(arrayBuffer);


        const pdf =
            await pdfjsLib.getDocument({
                data: typedArray
            }).promise;


        let completeText = "";


        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            const page =
                await pdf.getPage(
                    pageNumber
                );


            const textContent =
                await page.getTextContent();


            const pageText =
                textContent.items
                    .map(item => item.str)
                    .join(" ");


            completeText +=
                pageText + "\n\n";

        }


        if (policyText) {

            policyText.value =
                completeText.trim();

        }


        updateCharacterCount();


        showStatus(
            "PDF text extracted successfully. Your document is ready for analysis.",
            "success"
        );


    } catch (error) {

        console.error(
            "PDF extraction error:",
            error
        );


        showStatus(
            "Could not read this PDF. Please try another PDF.",
            "error"
        );

    }

}


// ============================================================
// CHARACTER COUNT
// ============================================================

function updateCharacterCount() {

    const policyText =
        document.getElementById(
            "policyText"
        );


    const characterCount =
        document.getElementById(
            "characterCount"
        );


    if (!policyText || !characterCount) {
        return;
    }


    characterCount.textContent =
        policyText.value.length +
        " characters";

}


// ============================================================
// MAIN ANALYZER
// ============================================================

function analyzePolicy() {

    const policyText =
        document.getElementById(
            "policyText"
        );


    if (!policyText) {
        return;
    }


    const text =
        policyText.value.trim();


    if (!text) {

        showStatus(
            "Please upload a PDF or paste a policy first.",
            "error"
        );

        return;

    }


    showStatus(
        "Analyzing policy locally...",
        "success"
    );


    const analysis =
        performAnalysis(text);


    renderReport(
        analysis
    );


    showStatus(
        "Privacy analysis completed locally.",
        "success"
    );


    const report =
        document.getElementById(
            "reportSection"
        );


    if (report) {

        report.style.display =
            "block";


        setTimeout(function () {

            report.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 200);

    }

}


// ============================================================
// ANALYSIS ENGINE
// ============================================================

function performAnalysis(text) {

    const lowerText =
        normalizeText(text);


    // ========================================================
    // DATA CATEGORIES
    // ========================================================

    const categories = {

        personal: {

            name: "Personal information",

            icon: "👤",

            terms: [
                "personal information",
                "personal data",
                "name",
                "email address",
                "phone number",
                "contact information",
                "identity",
                "account information"
            ]

        },


        device: {

            name: "Device information",

            icon: "📱",

            terms: [
                "device information",
                "device data",
                "advertising id",
                "advertising identifier",
                "operating system",
                "device identifier",
                "browser type"
            ]

        },


        location: {

            name: "Location information",

            icon: "📍",

            terms: [
                "location information",
                "precise location",
                "geolocation",
                "gps location",
                "location data"
            ]

        },


        network: {

            name: "IP / network information",

            icon: "🌐",

            terms: [
                "ip address",
                "internet protocol address",
                "network information",
                "network data"
            ]

        },


        browsing: {

            name: "Browsing / search activity",

            icon: "🔎",

            terms: [
                "browsing history",
                "browsing activity",
                "search history",
                "search activity",
                "usage data",
                "online activity"
            ]

        },


        tracking: {

            name: "Cookies / tracking",

            icon: "🍪",

            terms: [
                "cookies",
                "cookie",
                "tracking technologies",
                "tracking",
                "web beacons",
                "analytics",
                "pixels"
            ]

        }

    };


    // ========================================================
    // ANALYZE EACH DATA CATEGORY
    // ========================================================

    const results = {};


    Object.keys(categories).forEach(
        function (key) {

            const category =
                categories[key];


            const matches =
                getMatchedTerms(
                    lowerText,
                    category.terms
                );


            const status =
                analyzeCategoryContext(
                    lowerText,
                    category.terms
                );


            results[key] = {

                ...category,

                matches,

                status

            };

        }
    );


    // ========================================================
    // THIRD-PARTY SHARING
    // ========================================================

    const sharingPositiveTerms = [

        "share your personal information",
        "share personal information",
        "share your information",
        "share information",
        "third parties",
        "third party",
        "service providers",
        "business partners",
        "affiliates",
        "disclose your information",
        "disclose personal information",
        "disclosure of information"

    ];


    const sharingNegativeTerms = [

        "do not share",
        "do not disclose",
        "does not share",
        "does not disclose",
        "not shared",
        "not disclosed",
        "never share",
        "never disclose",
        "we don't share",
        "we don't disclose"

    ];


    const sharingDetected =
        containsAny(
            lowerText,
            sharingPositiveTerms
        );


    const sharingNegative =
        containsAny(
            lowerText,
            sharingNegativeTerms
        );


    let sharingStatus =
        "Not shared";


    if (
        sharingDetected
    ) {

        const conditionalSharing =
            containsAny(
                lowerText,
                [
                    "may share",
                    "may disclose",
                    "may provide",
                    "where necessary",
                    "when necessary",
                    "service providers",
                    "business partners",
                    "affiliates"
                ]
            );


        const explicitSharing =
            containsAny(
                lowerText,
                [
                    "we share",
                    "we disclose",
                    "we provide"
                ]
            );


        if (
            conditionalSharing &&
            !isStrongGlobalNegation(
                lowerText,
                sharingPositiveTerms
            )
        ) {

            sharingStatus =
                "Conditional";

        }

        else if (
            explicitSharing &&
            !sharingNegative
        ) {

            sharingStatus =
                "Shared";

        }

        else if (
            sharingNegative &&
            !conditionalSharing
        ) {

            sharingStatus =
                "Not shared";

        }

        else if (
            conditionalSharing
        ) {

            sharingStatus =
                "Conditional";

        }

    }


    // ========================================================
    // ADVERTISING
    // ========================================================

    const advertisingPositiveTerms = [

        "advertising",
        "advertisement",
        "marketing",
        "targeted advertising",
        "personalized advertising",
        "advertising profiles",
        "marketing communications"

    ];


    const advertisingNegativeTerms = [

        "do not use your information for advertising",
        "do not use your information for marketing",
        "do not use information for advertising",
        "not used for advertising",
        "not used to create advertising profiles",
        "not used for marketing",
        "do not create advertising profiles",
        "not create advertising profiles",
        "we do not use personal information for targeted advertising",
        "we do not use personal information for advertising"

    ];


    const advertisingNegative =
        containsAny(
            lowerText,
            advertisingNegativeTerms
        );


    const advertisingDetected =
        containsAny(
            lowerText,
            advertisingPositiveTerms
        );


    let advertisingStatus =
        "Not clearly detected";


    if (
        advertisingNegative
    ) {

        advertisingStatus =
            "Not used";

    }

    else if (
        advertisingDetected
    ) {

        const conditionalAdvertising =
            containsAny(
                lowerText,
                [
                    "may use",
                    "may be used",
                    "may use your information",
                    "use your information",
                    "use information",
                    "targeted advertising",
                    "personalized advertising"
                ]
            );


        if (
            conditionalAdvertising
        ) {

            advertisingStatus =
                "May be used";

        }

        else {

            advertisingStatus =
                "Mentioned";

        }

    }


    // ========================================================
    // DATA RETENTION
    // ========================================================

    const retentionTerms = [

        "retain personal information",
        "retain your information",
        "retain data",
        "retain information",
        "retains personal information",
        "retains your information",
        "retains data",
        "retains information",
        "data retention",
        "retention period",
        "stored for as long as",
        "store your information",
        "store personal information",
        "stored personal information",
        "delete your information",
        "delete personal information",
        "as long as reasonably necessary",
        "for as long as necessary"

    ];


    const retentionDetected =
        containsAny(
            lowerText,
            retentionTerms
        );


    // ========================================================
    // USER CONTROL
    // ========================================================

    const userControlTerms = [

        "access your information",
        "access personal information",
        "access your personal information",
        "request access",
        "right to access",

        "request deletion",
        "request correction",
        "request to delete",
        "delete your personal information",
        "delete personal information",
        "right to delete",
        "right to deletion",

        "correct your information",
        "correction of inaccurate information",
        "right to correction",

        "opt out",
        "opt-out",
        "withdraw consent",
        "privacy rights",
        "privacy right",
        "right to object",
        "right to withdraw",
        "consent",

        "marketing communications"

    ];


    const userControlMatches =
        userControlTerms.filter(
            term =>
                lowerText.includes(term)
        );


    const userControlDetected =
        userControlMatches.length > 0;


    let userControlStrength =
        "Limited";


    if (
        userControlMatches.length >= 4
    ) {

        userControlStrength =
            "Strong";

    }

    else if (
        userControlMatches.length >= 2
    ) {

        userControlStrength =
            "Good";

    }


    // ========================================================
    // RISK SCORE
    // ========================================================

    let riskScore = 0;


    // PERSONAL
    if (
        results.personal.status ===
        "Detected"
    ) {

        riskScore += 15;

    }

    else if (
        results.personal.status ===
        "Conditional"
    ) {

        riskScore += 10;

    }


    // DEVICE
    if (
        results.device.status ===
        "Detected"
    ) {

        riskScore += 10;

    }

    else if (
        results.device.status ===
        "Conditional"
    ) {

        riskScore += 6;

    }


    // LOCATION
    if (
        results.location.status ===
        "Detected"
    ) {

        riskScore += 15;

    }

    else if (
        results.location.status ===
        "Conditional"
    ) {

        riskScore += 10;

    }


    // NETWORK
    if (
        results.network.status ===
        "Detected"
    ) {

        riskScore += 8;

    }

    else if (
        results.network.status ===
        "Conditional"
    ) {

        riskScore += 5;

    }


    // BROWSING
    if (
        results.browsing.status ===
        "Detected"
    ) {

        riskScore += 12;

    }

    else if (
        results.browsing.status ===
        "Conditional"
    ) {

        riskScore += 7;

    }


    // TRACKING
    if (
        results.tracking.status ===
        "Detected"
    ) {

        riskScore += 15;

    }

    else if (
        results.tracking.status ===
        "Conditional"
    ) {

        riskScore += 8;

    }


    // SHARING
    if (
        sharingStatus ===
        "Shared"
    ) {

        riskScore += 15;

    }

    else if (
        sharingStatus ===
        "Conditional"
    ) {

        riskScore += 10;

    }


    // ADVERTISING
    if (
        advertisingStatus ===
        "May be used"
    ) {

        riskScore += 8;

    }


    // RETENTION
    if (
        retentionDetected
    ) {

        riskScore += 5;

    }


    // USER CONTROL REDUCTION
    if (
        userControlStrength ===
        "Strong"
    ) {

        riskScore -= 10;

    }

    else if (
        userControlStrength ===
        "Good"
    ) {

        riskScore -= 8;

    }


    // ========================================================
    // FINAL SCORE
    // ========================================================

    riskScore =
        Math.max(
            0,
            Math.min(
                100,
                riskScore
            )
        );


    // ========================================================
    // RISK LABEL
    // ========================================================

    let riskLabel;


    if (
        riskScore <= 25
    ) {

        riskLabel =
            "LOWER RISK";

    }

    else if (
        riskScore <= 50
    ) {

        riskLabel =
            "MODERATE RISK";

    }

    else if (
        riskScore <= 75
    ) {

        riskLabel =
            "HIGH RISK";

    }

    else {

        riskLabel =
            "VERY HIGH RISK";

    }


    return {

        results,

        sharingStatus,

        advertisingStatus,

        retentionDetected,

        userControlDetected,

        userControlMatches,

        userControlStrength,

        riskScore,

        riskLabel

    };

}


// ============================================================
// CONTEXT-AWARE CATEGORY ANALYSIS
// ============================================================
//
// IMPORTANT FIX:
//
// The previous version used a very large context window around
// every keyword. This could cause unrelated sentences such as:
//
// "We collect your name..."
// ...
// "We do not share your information."
//
// to interfere with one another.
//
// This version evaluates the text around EACH occurrence using
// sentence-level context first, with a small local fallback.
// ============================================================

function analyzeCategoryContext(
    lowerText,
    terms
) {

    const occurrences = [];


    terms.forEach(
        term => {

            let searchStart = 0;


            while (true) {

                const index =
                    lowerText.indexOf(
                        term,
                        searchStart
                    );


                if (
                    index === -1
                ) {

                    break;

                }


                occurrences.push({

                    term,

                    index

                });


                searchStart =
                    index +
                    term.length;

            }

        }
    );


    if (
        occurrences.length === 0
    ) {

        return "Not clearly detected";

    }


    let positiveCount = 0;

    let negativeCount = 0;

    let conditionalCount = 0;


    occurrences.forEach(
        occurrence => {

            const context =
                getLocalContext(
                    lowerText,
                    occurrence.index,
                    occurrence.term.length
                );


            const classification =
                classifyOccurrence(
                    context
                );


            if (
                classification ===
                "negative"
            ) {

                negativeCount++;

            }

            else if (
                classification ===
                "conditional"
            ) {

                conditionalCount++;

            }

            else if (
                classification ===
                "positive"
            ) {

                positiveCount++;

            }

        }
    );


    // ========================================================
    // DECISION
    // ========================================================

    if (
        positiveCount > 0
    ) {

        return "Detected";

    }


    if (
        conditionalCount > 0
    ) {

        return "Conditional";

    }


    if (
        negativeCount > 0
    ) {

        return "Not collected";

    }


    return "Not clearly detected";

}


// ============================================================
// GET LOCAL CONTEXT
// ============================================================

function getLocalContext(
    text,
    index,
    termLength
) {

    // First isolate the sentence containing the match.

    const sentenceStart =
        findSentenceStart(
            text,
            index
        );


    const sentenceEnd =
        findSentenceEnd(
            text,
            index + termLength
        );


    let context =
        text.slice(
            sentenceStart,
            sentenceEnd
        );


    // If the sentence is extremely large, use a smaller
    // local window around the matched term.

    if (
        context.length > 500
    ) {

        const localStart =
            Math.max(
                0,
                index - 120
            );


        const localEnd =
            Math.min(
                text.length,
                index +
                termLength +
                180
            );


        context =
            text.slice(
                localStart,
                localEnd
            );

    }


    return context;

}


// ============================================================
// FIND SENTENCE START
// ============================================================

function findSentenceStart(
    text,
    index
) {

    const before =
        text.slice(
            0,
            index
        );


    const punctuationPositions = [

        before.lastIndexOf("."),

        before.lastIndexOf("!"),

        before.lastIndexOf("?"),

        before.lastIndexOf("\n"),

        before.lastIndexOf(";")

    ];


    const lastBoundary =
        Math.max(
            ...punctuationPositions
        );


    return lastBoundary === -1
        ? 0
        : lastBoundary + 1;

}


// ============================================================
// FIND SENTENCE END
// ============================================================

function findSentenceEnd(
    text,
    index
) {

    const after =
        text.slice(
            index
        );


    const punctuationPositions = [

        getRelativeIndex(
            after,
            "."
        ),

        getRelativeIndex(
            after,
            "!"
        ),

        getRelativeIndex(
            after,
            "?"
        ),

        getRelativeIndex(
            after,
            "\n"
        ),

        getRelativeIndex(
            after,
            ";"
        )

    ].filter(
        position =>
            position !== -1
    );


    if (
        punctuationPositions.length === 0
    ) {

        return text.length;

    }


    return index +
        Math.min(
            ...punctuationPositions
        ) +
        1;

}


// ============================================================
// RELATIVE INDEX
// ============================================================

function getRelativeIndex(
    text,
    character
) {

    return text.indexOf(
        character
    );

}


// ============================================================
// CLASSIFY A SINGLE OCCURRENCE
// ============================================================

function classifyOccurrence(
    context
) {

    // --------------------------------------------------------
    // Strong negative patterns
    // --------------------------------------------------------

    const negativePatterns = [

        "do not collect",
        "do not directly collect",
        "don't collect",
        "does not collect",
        "not collect",
        "never collect",
        "not collected",

        "do not use",
        "don't use",
        "does not use",
        "not used",
        "never used",

        "do not receive",
        "don't receive",
        "does not receive",
        "not received",

        "do not obtain",
        "don't obtain",
        "does not obtain",
        "not obtained",

        "do not gather",
        "don't gather",
        "does not gather",
        "not gathered"

    ];


    // --------------------------------------------------------
    // Conditional patterns
    // --------------------------------------------------------

    const conditionalPatterns = [

        "may collect",
        "may receive",
        "may obtain",
        "may gather",
        "may use",

        "might collect",
        "might receive",
        "might obtain",

        "could collect",
        "could receive",
        "could obtain",

        "where necessary",
        "when necessary",
        "when you",
        "if you",
        "depending on",
        "where applicable",
        "limited information",
        "may include"

    ];


    // --------------------------------------------------------
    // Positive collection/use patterns
    // --------------------------------------------------------

    const positivePatterns = [

        "we collect",
        "we gather",
        "we obtain",
        "we receive",
        "collect your",
        "collect personal",
        "gather your",
        "obtain your",
        "receive your",
        "information we collect",
        "information we receive"

    ];


    // --------------------------------------------------------
    // IMPORTANT:
    // Check NEGATIVE first.
    // --------------------------------------------------------

    if (
        containsAny(
            context,
            negativePatterns
        )
    ) {

        return "negative";

    }


    // --------------------------------------------------------
    // Then conditional.
    // --------------------------------------------------------

    if (
        containsAny(
            context,
            conditionalPatterns
        )
    ) {

        return "conditional";

    }


    // --------------------------------------------------------
    // Then explicit positive.
    // --------------------------------------------------------

    if (
        containsAny(
            context,
            positivePatterns
        )
    ) {

        return "positive";

    }


    return "unknown";

}


// ============================================================
// RENDER COMPLETE REPORT
// ============================================================

function renderReport(analysis) {

    renderExecutiveSummary(
        analysis
    );


    renderRiskScore(
        analysis
    );


    renderOverviewCards(
        analysis
    );


    renderDataFlow(
        analysis
    );


    renderInformationCategories(
        analysis
    );


    renderImportantFindings(
        analysis
    );


    renderEvidence(
        analysis
    );

}


// ============================================================
// EXECUTIVE SUMMARY
// ============================================================

function renderExecutiveSummary(
    analysis
) {

    const container =
        document.getElementById(
            "executiveSummary"
        );


    if (!container) {
        return;
    }


    const detectedData = [];


    Object.values(
        analysis.results
    ).forEach(
        result => {

            if (
                result.status === "Detected" ||
                result.status === "Conditional"
            ) {

                detectedData.push(
                    result.name.toLowerCase()
                );

            }

        }
    );


    let summary = "";


    if (
        detectedData.length === 0
    ) {

        summary =
            "PrivyLens did not clearly detect major categories of personal information being collected in the policy.";

    }

    else {

        summary =
            "PrivyLens detected references to " +
            detectedData.join(", ") +
            " in the policy.";

    }


    if (
        analysis.sharingStatus !==
        "Not shared"
    ) {

        summary +=
            " The policy contains language about sharing or disclosure of information.";

    }


    if (
        analysis.advertisingStatus ===
        "May be used"
    ) {

        summary +=
            " Advertising or marketing-related use is mentioned.";

    }


    if (
        analysis.retentionDetected
    ) {

        summary +=
            " The policy also contains data-retention language.";

    }


    if (
        analysis.userControlDetected
    ) {

        summary +=
            " Privacy-rights or user-control terms were detected.";

    }


    container.textContent =
        summary;

}


// ============================================================
// RISK SCORE
// ============================================================

function renderRiskScore(
    analysis
) {

    const scoreElement =
        document.getElementById(
            "riskScore"
        );


    const levelElement =
        document.getElementById(
            "riskLevel"
        );


    if (scoreElement) {

        scoreElement.textContent =
            analysis.riskScore;

    }


    if (levelElement) {

        levelElement.textContent =
            analysis.riskLabel;

    }

}


// ============================================================
// OVERVIEW CARDS
// ============================================================

function renderOverviewCards(
    analysis
) {

    const collectionElement =
        document.getElementById(
            "collectionStatus"
        );


    const sharingElement =
        document.getElementById(
            "sharingStatus"
        );


    const trackingElement =
        document.getElementById(
            "trackingStatus"
        );


    const controlElement =
        document.getElementById(
            "controlStatus"
        );


    if (collectionElement) {

        collectionElement.textContent =
            getCollectionOverall(
                analysis
            );

    }


    if (sharingElement) {

        sharingElement.textContent =
            analysis.sharingStatus;

    }


    if (trackingElement) {

        trackingElement.textContent =
            analysis.results.tracking.status;

    }


    if (controlElement) {

        controlElement.textContent =
            analysis.userControlStrength;

    }

}


// ============================================================
// DATA FLOW
// ============================================================

function renderDataFlow(
    analysis
) {

    const dataCollected =
        document.getElementById(
            "dataCollected"
        );


    const dataShared =
        document.getElementById(
            "dataShared"
        );


    const advertising =
        document.getElementById(
            "advertisingStatus"
        );


    const retention =
        document.getElementById(
            "retentionStatus"
        );


    const controls =
        document.getElementById(
            "privacyControls"
        );


    if (dataCollected) {

        dataCollected.textContent =
            getStatuses(
                analysis,
                [
                    "personal",
                    "device",
                    "location",
                    "network",
                    "browsing"
                ]
            );

    }


    if (dataShared) {

        dataShared.textContent =
            analysis.sharingStatus;

    }


    if (advertising) {

        advertising.textContent =
            analysis.advertisingStatus;

    }


    if (retention) {

        retention.textContent =
            analysis.retentionDetected
                ? "Retention language detected"
                : "Not clearly detected";

    }


    if (controls) {

        controls.textContent =
            analysis.userControlDetected
                ? analysis.userControlStrength +
                  " privacy controls detected"
                : "Limited or unclear";

    }

}


// ============================================================
// INFORMATION CATEGORIES
// ============================================================

function renderInformationCategories(
    analysis
) {

    const container =
        document.getElementById(
            "informationCategories"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        Object.values(
            analysis.results
        )
        .map(
            result => `

                <div
                    style="
                    display:flex;
                    align-items:center;
                    gap:15px;
                    border-bottom:1px solid #eeeeee;
                    padding:14px 5px;
                    "
                >

                    <span
                        style="
                        font-size:25px;
                        "
                    >
                        ${result.icon}
                    </span>


                    <div
                        style="flex:1;"
                    >

                        <strong>
                            ${escapeHTML(
                                result.name
                            )}
                        </strong>


                        <div
                            style="
                            margin-top:4px;
                            color:#6b7280;
                            "
                        >
                            ${escapeHTML(
                                result.status
                            )}
                        </div>

                    </div>


                    <span
                        style="
                        color:#6b7280;
                        font-size:13px;
                        "
                    >
                        ${result.matches.length}
                        match${
                            result.matches.length === 1
                                ? ""
                                : "es"
                        }

                    </span>

                </div>

            `
        )
        .join("");

}


// ============================================================
// IMPORTANT FINDINGS
// ============================================================

function renderImportantFindings(
    analysis
) {

    const container =
        document.getElementById(
            "importantFindings"
        );


    if (!container) {
        return;
    }


    const findings = [];


    // ========================================================
    // THIRD-PARTY SHARING
    // ========================================================

    if (
        analysis.sharingStatus ===
        "Conditional"
    ) {

        findings.push({

            type: "warning",

            title:
                "Third-party sharing",

            text:
                "The policy contains conditional language related to sharing or disclosure of information with third parties, service providers, affiliates, or business partners."

        });

    }

    else if (
        analysis.sharingStatus ===
        "Shared"
    ) {

        findings.push({

            type: "warning",

            title:
                "Third-party sharing",

            text:
                "The policy contains language indicating that information may be shared or disclosed with other organizations."

        });

    }

    else {

        findings.push({

            type: "positive",

            title:
                "Third-party sharing not detected",

            text:
                "The analyzer did not detect clear language indicating that information is shared with third parties."

        });

    }


    // ========================================================
    // ADVERTISING
    // ========================================================

    if (
        analysis.advertisingStatus ===
        "May be used"
    ) {

        findings.push({

            type: "warning",

            title:
                "Advertising",

            text:
                "The policy contains references to advertising, marketing, or targeted advertising."

        });

    }

    else if (
        analysis.advertisingStatus ===
        "Not used"
    ) {

        findings.push({

            type: "positive",

            title:
                "Advertising use restricted",

            text:
                "The policy contains language indicating that information or technologies are not used for advertising-related profiling or marketing purposes."

        });

    }


    // ========================================================
    // DATA RETENTION
    // ========================================================

    if (
        analysis.retentionDetected
    ) {

        findings.push({

            type: "warning",

            title:
                "Data retention",

            text:
                "The policy contains language concerning how information may be retained, stored, or deleted."

        });

    }


    // ========================================================
    // USER CONTROLS
    // ========================================================

    if (
        analysis.userControlDetected
    ) {

        findings.push({

            type: "positive",

            title:
                "Privacy controls detected",

            text:
                "Privacy-control language was detected, including terms related to access, correction, deletion, consent, objection, or opt-out rights."

        });

    }

    else {

        findings.push({

            type: "warning",

            title:
                "Limited user controls detected",

            text:
                "The analyzer did not clearly detect common privacy-control terms such as access, deletion, opt-out, correction, or privacy rights."

        });

    }


    // ========================================================
    // RENDER FINDINGS
    // ========================================================

    container.innerHTML =
        findings.map(
            finding => {

                const isPositive =
                    finding.type ===
                    "positive";


                return `

                    <div
                        style="
                        padding:20px;
                        border-radius:12px;
                        border:1px solid ${
                            isPositive
                                ? "#bbf7d0"
                                : "#fed7aa"
                        };
                        background:${
                            isPositive
                                ? "#f0fdf4"
                                : "#fff7ed"
                        };
                        "
                    >

                        <h3>

                            ${
                                isPositive
                                    ? "🟢"
                                    : "⚠️"
                            }

                            ${escapeHTML(
                                finding.title
                            )}

                        </h3>


                        <p
                            style="
                            line-height:1.7;
                            color:#555;
                            "
                        >
                            ${escapeHTML(
                                finding.text
                            )}
                        </p>

                    </div>

                `;

            }
        ).join("");

}


// ============================================================
// EVIDENCE
// ============================================================

function renderEvidence(
    analysis
) {

    const container =
        document.getElementById(
            "evidenceList"
        );


    if (!container) {
        return;
    }


    const policyTextElement =
        document.getElementById(
            "policyText"
        );


    if (!policyTextElement) {
        return;
    }


    const policyText =
        policyTextElement.value;


    const evidenceCategories =
        Object.values(
            analysis.results
        ).filter(
            result =>
                result.status !==
                "Not clearly detected"
        );


    if (
        evidenceCategories.length === 0
    ) {

        container.innerHTML = `

            <p
                style="
                color:#6b7280;
                "
            >
                No strong evidence excerpts were
                identified.
            </p>

        `;

        return;

    }


    const evidenceHTML =
        evidenceCategories.map(
            result => {

                const excerpt =
                    findEvidence(
                        policyText,
                        result.matches
                    );


                return `

                    <div
                        style="
                        margin-bottom:22px;
                        padding:20px;
                        border:1px solid #e5e7eb;
                        border-radius:12px;
                        "
                    >

                        <h3>
                            ${result.icon}
                            ${escapeHTML(
                                result.name
                            )}
                        </h3>


                        <p
                            style="
                            color:#2563eb;
                            font-weight:600;
                            "
                        >
                            ${escapeHTML(
                                result.status
                            )}
                        </p>


                        <blockquote
                            style="
                            margin:12px 0 0;
                            padding:15px;
                            background:#f8fafc;
                            border-left:4px solid #cbd5e1;
                            line-height:1.7;
                            color:#4b5563;
                            "
                        >
                            “${escapeHTML(
                                excerpt
                            )}”
                        </blockquote>


                        <small
                            style="
                            color:#6b7280;
                            "
                        >
                            Detected from the policy
                            text you provided.
                        </small>

                    </div>

                `;

            }
        ).join("");


    container.innerHTML =
        evidenceHTML;

}


// ============================================================
// FIND EVIDENCE
// ============================================================

function findEvidence(
    text,
    matches
) {

    if (
        !matches ||
        matches.length === 0
    ) {

        return "No specific evidence excerpt identified.";

    }


    const lowerText =
        normalizeText(text);


    for (
        const match of matches
    ) {

        const index =
            lowerText.indexOf(
                match.toLowerCase()
            );


        if (
            index !== -1
        ) {

            const start =
                Math.max(
                    0,
                    index - 120
                );


            const end =
                Math.min(
                    text.length,
                    index +
                    match.length +
                    180
                );


            return text
                .slice(
                    start,
                    end
                )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();

        }

    }


    return matches.join(", ");

}


// ============================================================
// COLLECTION OVERALL
// ============================================================

function getCollectionOverall(
    analysis
) {

    const statuses =
        Object.values(
            analysis.results
        ).map(
            result =>
                result.status
        );


    if (
        statuses.includes(
            "Detected"
        )
    ) {

        return "Detected";

    }


    if (
        statuses.includes(
            "Conditional"
        )
    ) {

        return "Conditional";

    }


    if (
        statuses.includes(
            "Not collected"
        )
    ) {

        return "Not collected";

    }


    return "Not clearly detected";

}


// ============================================================
// STATUS SUMMARY
// ============================================================

function getStatuses(
    analysis,
    keys
) {

    const found =
        keys
            .map(
                key =>
                    analysis.results[key]
            )
            .filter(Boolean)
            .filter(
                result =>
                    result.status ===
                    "Detected" ||
                    result.status ===
                    "Conditional"
            )
            .map(
                result =>
                    result.name
            );


    if (
        found.length === 0
    ) {

        return "No major collection categories clearly detected.";

    }


    return found.join(
        ", "
    );

}


// ============================================================
// GET MATCHED TERMS
// ============================================================

function getMatchedTerms(
    text,
    terms
) {

    return terms.filter(
        term =>
            text.includes(
                term
            )
    );

}


// ============================================================
// NORMALIZE TEXT
// ============================================================

function normalizeText(
    text
) {

    return String(text)
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


// ============================================================
// CHECK ANY TERM
// ============================================================

function containsAny(
    text,
    terms
) {

    return terms.some(
        term =>
            text.includes(
                term
            )
    );

}


// ============================================================
// CHECK GLOBAL NEGATION
// ============================================================
//
// Used only for sharing-type logic.
// Data-category analysis uses sentence-local logic instead.
// ============================================================

function isStrongGlobalNegation(
    text,
    positiveTerms
) {

    const negativeSharingPatterns = [

        "we do not share",
        "we do not disclose",
        "we don't share",
        "we don't disclose",
        "we never share",
        "we never disclose"

    ];


    const hasNegative =
        containsAny(
            text,
            negativeSharingPatterns
        );


    if (
        !hasNegative
    ) {

        return false;

    }


    // If there is also explicit conditional sharing,
    // do not automatically treat the entire policy as
    // "not shared".

    const conditionalPatterns = [

        "may share",
        "may disclose",
        "service providers",
        "business partners",
        "affiliates",
        "where necessary"

    ];


    return !containsAny(
        text,
        conditionalPatterns
    );

}


// ============================================================
// CLEAR
// ============================================================

function clearAll() {

    const policyFile =
        document.getElementById(
            "policyFile"
        );


    const fileName =
        document.getElementById(
            "fileName"
        );


    const policyText =
        document.getElementById(
            "policyText"
        );


    const report =
        document.getElementById(
            "reportSection"
        );


    if (policyText) {

        policyText.value =
            "";

    }


    if (policyFile) {

        policyFile.value =
            "";

    }


    if (fileName) {

        fileName.textContent =
            "";

    }


    updateCharacterCount();


    if (report) {

        report.style.display =
            "none";

    }


    showStatus(
        "Your current document and extracted text have been cleared.",
        "success"
    );

}


// ============================================================
// STATUS
// ============================================================

function showStatus(
    message,
    type
) {

    const statusMessage =
        document.getElementById(
            "statusMessage"
        );


    if (!statusMessage) {
        return;
    }


    statusMessage.textContent =
        message;


    if (
        type === "error"
    ) {

        statusMessage.style.color =
            "#dc2626";

    }

    else {

        statusMessage.style.color =
            "#16a34a";

    }

}


// ============================================================
// HTML SAFETY
// ============================================================

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}