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
  select(`Constituency ID`, `Constituency Name`, `Total number of valid votes counted`, C, Lab, LD, SNP, UKIP)

# Clean up column names
colnames(general.results) <- c(
  "id",
  "name",
  "total.votes",
  "con",
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
    lab = ifelse(is.na(lab), 0, lab),
    ld = ifelse(is.na(ld), 0, ld),
    snp = ifelse(is.na(snp), 0, snp),
    ukip = ifelse(is.na(ukip), 0, ukip)
  ) %>%
  mutate(other = total.votes - (con + lab + ld + snp + ukip)) %>%
  mutate(
    con.15 = con / total.votes * 100,
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

# Conservative: leave
# Labour: remain
# Scottish National: remain
# Liberal Democrats: remain

# Since ref if there is a swing in remain, it can't be more than 10%, so 0.6 to 0.4 leave vote
# If in a leave place, but you want to remain, who should you vote for? Anybody but conservatives, but don't want to split
# So you should choose which party is the second-most popular party in that district

SwingStatus5 <- function(leave) {
  if (is.na(leave)) {
    return(NA)
  } else if (leave < 0.45) {
    return("Solid remain")
  } else if (leave < 0.5) {
    return("Could swing to leave")
  } else if (leave <= 0.55) {
    return ("Could swing to remain")
  } else {
    return("Solid leave")
  }
}

TacticalRemainVote <- function(lab, ld, snp) {
  # Liberal Democrats are closest to a win
  if (ld > snp & ld > lab) {
    return("ld")
  # SNP is closest to a win
  } else if (snp > ld & snp > lab) {
    return ("snp")
  # Labor is closest to a win
  } else {
    return("lab")
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

merged.results$swing.status.5 <- sapply(merged.results$leave.16, SwingStatus5)

merged.results$tactical.remain.vote <- mapply(
  TacticalRemainVote,
  merged.results$lab.15,
  merged.results$ld.15,
  merged.results$snp.15
)

merged.results$tactical.leave.vote <- mapply(
  TacticalLeaveVote,
  merged.results$con.15,
  merged.results$ukip.15
)

write_csv(merged.results, "merged.results.csv")

graphic <- merged.results %>%
  select(-total.votes, -con, -lab, -ld, -snp, -con, -ukip, -other)

write_csv(graphic, "src/data/graphic.csv")
