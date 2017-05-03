library(dplyr)
library(readr)
library(readxl)
library(reshape2)

SWING_MARGIN = 5

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
    ukip = ifelse(is.na(ukip), 0, ukip),
    other = total.votes - (con + green + lab + ld + snp + ukip)
  ) %>%
  mutate(
    con.pct = con / total.votes * 100,
    green.pct = green / total.votes * 100,
    lab.pct = lab / total.votes * 100,
    ld.pct = ld / total.votes * 100,
    snp.pct = snp / total.votes * 100,
    ukip.pct = ukip / total.votes * 100,
    other.pct = other / total.votes * 100
  )

AnalyzePartyVotes <- function(r) {
  parties <- data_frame(
    party = c("con", "green", "lab", "ld", "snp", "ukip"),
    position = c("leave", "remain", "remain", "remain", "remain", "leave"),
    votes = c(r$con.pct, r$green.pct, r$lab.pct, r$ld.pct, r$snp.pct, r$ukip.pct)
  ) %>% arrange(desc(votes))
  
  # Winner
  winner <- parties %>%
    slice(1)
  
  # Leave
  leave.parties <- parties %>%
    filter(position == "leave")
  
  leave.top <- leave.parties %>%
    slice(1)
  
  leave.total <- leave.parties %>%
    summarise(votes = sum(votes))
  
  # Remain
  parties.remain <- parties %>%
    filter(position == "remain")
  
  remain.top <- parties.remain %>%
    slice(1)
  
  remain.total <- parties.remain %>%
    summarise(votes = sum(votes))
  
  leave.ideal.case <- winner$party
  remain.ideal.case <- winner$party
  
  if (leave.top$votes - remain.total$votes > SWING_MARGIN) {
    party.status <- "Solid leave"
  } else if (remain.top$votes - leave.total$votes > SWING_MARGIN) {
    party.status <- "Solid remain"
  } else if (abs(leave.top$votes - remain.top$votes) < SWING_MARGIN) {
    party.status <- "Swing"
    
    leave.ideal.case <- leave.top$party
    remain.ideal.case <- remain.top$party
  } else {
    party.status <- "Tactical swing"
    
    leave.ideal.case <- leave.top$party
    remain.ideal.case <- remain.top$party
  }
  
  data_frame(
    winner.party = winner$party,
    winner.position = winner$position,
    leave.top.party = leave.top$party,
    leave.top.votes = leave.top$votes,
    leave.total.votes = leave.total$votes,
    remain.top.party = remain.top$party,
    remain.top.votes = remain.top$votes,
    remain.total.votes = remain.total$votes,
    party.status = party.status,
    leave.ideal.case = leave.ideal.case,
    remain.ideal.case = remain.ideal.case
  )
}

# Derive data from party vote totals
general.results <- general.results %>%
  by_row(AnalyzePartyVotes, .collate = "cols") %>%
  setNames(gsub("1", "", names(.)))

# Load brexit vote results
brexit.results <- read_csv(
  "Final estimates of the Leave vote share in the EU referendum - google_sheets.csv",
  col_names = c(
    "id",
    "leave.16.exact",
    "leave.16"
  ),
  col_types = "c__d_d__",
  skip = 1
)

# Flag results that are known exactly
brexit.results$leave.16.exact <- !is.na(brexit.results$leave.16.exact)

# Adjust percents for consistency
brexit.results$leave.16 <- brexit.results$leave.16 * 100

# Find possible Brexit swing votes
BrexitSwingStatus <- function(leave, swing) {
  if (is.na(leave)) {
    return(NA)
  } else if (leave < 50 - SWING_MARGIN) {
    return("Solid remain")
  } else if (leave > 50 + SWING_MARGIN) {
    return("Solid leave")
  } else {
    return("Swing")
  }
}

brexit.results <- brexit.results %>%
  rowwise() %>%
  mutate(
    brexit.status = BrexitSwingStatus(leave.16)
  )

# Merge results
merged.results <- general.results %>%
  left_join(brexit.results, by = "id")

PracticalCase <- function(brexit.status, party.status, tactical) {
  if (is.na(brexit.status)) {
    return(NA)
  }
  
  if (brexit.status == "Swing") {
    if ((party.status == "Swing") || (party.status == "Tactical swing")) {
      return(tactical)
    }
  }
  
  NA
}

merged.results <- merged.results %>%
  rowwise() %>%
  mutate(
    leave.practical.case = PracticalCase(brexit.status, party.status, leave.top.party),
    remain.practical.case = PracticalCase(brexit.status, party.status, remain.top.party)
  )

write_csv(merged.results, "merged.results.csv")

# graphic <- merged.results
graphic <- merged.results %>%
  select(
    id, name,
    leave.total.votes, remain.total.votes,
    leave.top.party, remain.top.party,
    leave.ideal.case, remain.ideal.case,
    leave.practical.case, remain.practical.case,
    leave.16
  )

write_csv(graphic, "src/data/graphic.csv")
