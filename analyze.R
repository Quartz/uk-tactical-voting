library(dplyr)
library(readr)
library(readxl)

# Load general election id mapping
id.mapping <- read_excel(
  "2015-UK-general-election-data-results-WEB.xlsx", 
  sheet = "Constituency"
) %>%
  select(PANO, `Constituency ID`)

# Load general election results
general.results <- read_excel(
  "2015-UK-general-election-data-results-WEB.xlsx", 
  sheet = "Results for analysis"
)

# Map constituency id's and clean up results
general.results <- general.results %>%
  # Filter out total row
  filter(!is.na(`Press Association ID Number`)) %>%
  left_join(id.mapping, by.x = `Press Association ID Number`, by.y = PANO) %>%
  select(`Constituency ID`, `Constituency Name`, `Total number of valid votes counted`, C, Green, Lab, LD, SNP, UKIP)

# Clean up column names
colnames(general.results) <- c(
  "id",
  "name",
  "total.votes",
  "con",
  "green",
  "lab",
  "ld",
  "snp",
  "ukip"
)

# Convert counts to share of vote
general.results <- general.results %>%
  # Convert NA counts to zero
  mutate(
    con = ifelse(is.na(con), 0, con),
    green = ifelse(is.na(green), 0, green),
    lab = ifelse(is.na(lab), 0, lab),
    ld = ifelse(is.na(ld), 0, ld),
    snp = ifelse(is.na(snp), 0, snp),
    ukip = ifelse(is.na(ukip), 0, ukip)
  ) %>%
  mutate(other = total.votes - (con + green + lab + ld + snp + ukip)) %>%
  mutate(
    con.15 = con / total.votes * 100,
    green.15 = green / total.votes * 100,
    lab.15 = lab / total.votes * 100,
    ld.15 = ld / total.votes * 100,
    snp.15 = snp / total.votes * 100,
    ukip.15 = ukip / total.votes * 100,
    other.15 = other / total.votes * 100
  )

# Load brexit vote results
brexit.results <- read_csv(
  "Final estimates of the Leave vote share in the EU referendum - google_sheets.csv",
  col_names = c(
    "id",
    "leave.estimate",
    "leave.exact",
    "leave.16"
  ),
  col_types = "c_dd_d__",
  skip = 1
)

# Flag results that are known exactly
brexit.results$leave.exact <- !is.na(brexit.results$leave.exact)

# Merge results
merged.results <- general.results %>%
  left_join(brexit.results, by = "id")

# Adjust percents for consistency
merged.results$leave.estimate <- merged.results$leave.estimate * 100
merged.results$leave.16 <- merged.results$leave.16 * 100

# Find possible Brexit swing votes
BrexitSwingStatus <- function(leave, swing) {
  if (is.na(leave)) {
    return(NA)
  } else if (leave < 50 - swing) {
    return("Solid remain")
  } else if (leave < 50) {
    return("Could swing to leave")
  } else if (leave <= 50 + swing) {
    return ("Could swing to remain")
  } else {
    return("Solid leave")
  }
}

PartySwingStatus <- function(lab, ld, snp, green, con, ukip, swing) {
  left <- lab + ld + snp + green
  right <- con + ukip
  
  if (right - left > swing) {
    return("Solid right")
  } else if (left - right > swing) {
    return("Solid left")
  } else {
    return("Swing")
  }
}

TacticalRemainVote <- function(lab, ld, snp, green) {
  m <- max(lab, ld, snp, green)
  
  if (lab == m) {
    return("lab")
  } else if (ld == m) {
    return("ld")
  } else if (snp == m) {
    return("snp")
  } else {
    return("green")
  }
}

TacticalLeaveVote <- function(con, ukip) {
  # UKIP is closest to a win
  if (ukip > con) {
    return("ukip")
  # Conservatives are closest to a win
  } else {
    return("con")
  }
}

merged.results$brexit.swing.status.5 <- mapply(
  BrexitSwingStatus,
  merged.results$leave.16,
  5
)

merged.results$brexit.swing.status.10 <- mapply(
  BrexitSwingStatus,
  merged.results$leave.16,
  10
)

merged.results$party.swing.status.5 <- mapply(
  PartySwingStatus,
  merged.results$lab.15,
  merged.results$ld.15,
  merged.results$snp.15,
  merged.results$green.15,
  merged.results$con.15,
  merged.results$ukip.15,
  5
)

merged.results$party.swing.status.10 <- mapply(
  PartySwingStatus,
  merged.results$lab.15,
  merged.results$ld.15,
  merged.results$snp.15,
  merged.results$green.15,
  merged.results$con.15,
  merged.results$ukip.15,
  10
)

merged.results$tactical.remain.vote <- mapply(
  TacticalRemainVote,
  merged.results$lab.15,
  merged.results$ld.15,
  merged.results$snp.15,
  merged.results$green.15
)

merged.results$tactical.leave.vote <- mapply(
  TacticalLeaveVote,
  merged.results$con.15,
  merged.results$ukip.15
)

write_csv(merged.results, "merged.results.csv")

graphic <- merged.results %>%
  select(-total.votes, -con, -green, -lab, -ld, -snp, -con, -ukip, -other)

write_csv(graphic, "src/data/graphic.csv")
