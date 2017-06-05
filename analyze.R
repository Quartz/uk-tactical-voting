library(dplyr)
library(purrrlyr)
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
  select(`Constituency ID`, `Constituency Name`, `Region`, `Total number of valid votes counted`, C, DUP, Green, Lab, `Lab Co-op`, LD, PC, SDLP, SF, SNP, Speaker, UKIP, UUP)

# Clean up column names
colnames(general.results) <- c(
  "id",
  "name",
  "region",
  "total.votes",
  "con",
  "dup",
  "green",
  "lab",
  "lab_coop",
  "ld",
  "pc",
  "sdlp",
  "sf",
  "snp",
  "speaker",
  "ukip",
  "uup"
)

# By-election: Oldham West & Royton
# http://committees.oldham.gov.uk/mgElectionAreaResults.aspx?ID=158&RPID=10998446
general.results[general.results$id == 'E14000871', 4:17] <-
  c(27706, 2596, 0, 249, 17209, 0, 1024, 0, 0, 0, 0, 0, 6487, 0)

# By-election: Sheffield Brightside & Hillsborough
# https://web.archive.org/web/20160604053020/https://www.sheffield.gov.uk/your-city-council/elections/election-results/2016/brightside-hillsborough-by-election.html
general.results[general.results$id == 'E14000921', 4:17] <-
  c(22581, 1267, 0, 938, 14087, 0, 1385, 0, 0, 0, 0, 0, 4497, 0)

# By-election: Ogmore
# http://www.bbc.com/news/uk-wales-south-east-wales-36219570
general.results[general.results$id == 'W07000074', 4:17] <-
  c(23532, 2956, 0, 0, 12383, 0, 702, 3683, 0, 0, 0, 0, 3808, 0)

# By-election: Tooting
# http://www.wandsworth.gov.uk/info/200327/election_results/2167/tooting_constituency_by-election_result_june_2016
general.results[general.results$id == 'E14000998', 4:17] <-
  c(32048, 11537, 0, 830, 17894, 0, 820, 0, 0, 0, 0, 0, 507, 0)
  
# By-election: Batley and Spen
# https://democracy.kirklees.gov.uk/mgElectionAreaResults.aspx?ID=161&RPID=502428457
general.results[general.results$id == 'E14000548', 4:17] <-
  c(20393, 0, 0, 0, 17506, 0, 0, 0, 0, 0, 0, 0, 0, 0)

# By-election: Witney
# http://www.witneygazette.co.uk/news/14815246.AS_IT_HAPPENED__Conservative_Robert_Courts_elected_as_Witney_s_new_MP/
general.results[general.results$id == 'E14001046', 4:17] <-
  c(38455, 17313, 0, 1363, 5765, 0, 11611, 0, 0, 0, 0, 0, 1354, 0)

# By-election: Richmond Park
# https://cabnet.richmond.gov.uk/mgElectionAreaResults.aspx?ID=81&RPID=503020385
general.results[general.results$id == 'E14000896', 4:17] <-
  c(41283, 18638, 0, 0, 1515, 0, 20510, 0, 0, 0, 0, 0, 0, 0)

# By-election: Sleaford and North Hykeham
# https://www.independent.co.uk/news/uk/politics/sleaford-and-north-hykeham-by-election-results-in-full-conservative-labour-ukip-lib-dems-a7464916.html
general.results[general.results$id == 'E14000929', 4:17] <-
  c(32834, 17570, 0, 0, 3363, 0, 3606, 0, 0, 0, 0, 0, 4426, 0)

# By-election: Copeland
# https://www.theguardian.com/politics/blog/live/2017/feb/23/stoke-and-copeland-byelections-voting-almost-over-as-labour-hope-to-hold-seats-politics-live?page=with:block-58afa222e4b05f755cc0bce1#block-58afa222e4b05f755cc0bce1
general.results[general.results$id == 'E14000647', 4:17] <-
  c(31068, 13748, 0, 515, 11601, 0, 2252, 0, 0, 0, 0, 0, 2025, 0)

# By-election: Stoke-on-Trent Central
# https://www.theguardian.com/politics/blog/live/2017/feb/23/stoke-and-copeland-byelections-voting-almost-over-as-labour-hope-to-hold-seats-politics-live?page=with:block-58af98f8e4b030b6f7c8e8af#block-58af98f8e4b030b6f7c8e8af
general.results[general.results$id == 'E14000972', 4:17] <-
  c(21170, 5154, 0, 294, 7853, 0, 2083, 0, 0, 0, 0, 0, 5233, 0)
  
# Convert counts to share of vote
general.results <- general.results %>%
  # Convert NA counts to zero
  mutate(
    con = ifelse(is.na(con), 0, con),
    dup = ifelse(is.na(dup), 0, dup),
    green = ifelse(is.na(green), 0, green),
    lab = ifelse(is.na(lab), 0, lab) + ifelse(is.na(lab_coop), 0, lab_coop),
    ld = ifelse(is.na(ld), 0, ld),
    pc = ifelse(is.na(pc), 0, pc),
    sdlp = ifelse(is.na(sdlp), 0, sdlp),
    sf = ifelse(is.na(sf), 0, sf),
    snp = ifelse(is.na(snp), 0, snp),
    speaker = ifelse(is.na(speaker), 0, speaker),
    ukip = ifelse(is.na(ukip), 0, ukip),
    uup = ifelse(is.na(uup), 0, uup),
    other = total.votes - (con + dup + green + lab + ld + pc + sdlp + sf + snp + speaker + ukip + uup)
  ) %>%
  # Drop alternate labour group
  select(-lab_coop) %>%
  # Compute vote shares
  mutate(
    con.pct = con / total.votes * 100,
    dup.pct = dup / total.votes * 100,
    green.pct = green / total.votes * 100,
    lab.pct = lab / total.votes * 100,
    ld.pct = ld / total.votes * 100,
    pc.pct = pc / total.votes * 100,
    sdlp.pct = sdlp / total.votes * 100,
    sf.pct = sf / total.votes * 100,
    snp.pct = snp / total.votes * 100,
    speaker.pct = speaker / total.votes * 100,
    ukip.pct = ukip / total.votes * 100,
    uup.pct = uup / total.votes * 100,
    other.pct = other / total.votes * 100
  )

#' Analyze a single constituency's general election results
#'
#' @param r A row from the results table.
#'
#' @return A data.frame of computed columns to add to the row.
AnalyzePartyVotes <- function(r) {
  # Build party results table
  parties <- data_frame(
    party = c("con", "dup", "green", "lab", "ld", "pc", "sdlp", "sf", "snp", "speaker", "ukip", "uup"),
    position = c("leave", NA, "remain", "remain", "remain", NA, NA, NA, "remain", NA, "leave", NA),
    votes = c(r$con.pct, r$dup.pct, r$green.pct, r$lab.pct, r$ld.pct, r$pc.pct, r$sdlp.pct, r$sf.pct, r$snp.pct, r$speaker.pct, r$ukip.pct, r$uup.pct)
  ) %>% arrange(desc(votes))
  
  # Find winner of general election
  winner <- parties %>%
    slice(1)
  
  # Filter to leave parties
  leave.parties <- parties %>%
    filter(position == "leave")
  
  # Find top vote-getting leave party
  leave.top <- leave.parties %>%
    slice(1)
  
  # Calculate the total number of votes won by all leave parties
  leave.total <- leave.parties %>%
    summarise(votes = sum(votes))
  
  # Filter to remain parties
  parties.remain <- parties %>%
    filter(position == "remain")
  
  # Find top vote-getting remain party
  remain.top <- parties.remain %>%
    slice(1)
  
  # Calculate the total number of votes won by all remain parties
  remain.total <- parties.remain %>%
    summarise(votes = sum(votes))
  
  # By default, the ideal case is to stick with the previous winner
  leave.ideal.case <- winner$party
  remain.ideal.case <- winner$party
  
  # Exclude Northern Ireland because its crazy
  if (r$region == "Northern Ireland") {
    party.status = "Ignore"
  # Leave exceeds remain by larger than the swing margin
  } else if (leave.top$votes - remain.total$votes > SWING_MARGIN) {
    party.status <- "Solid leave"
  # Remain exceeds leave by larger than the swing margin
  } else if (remain.top$votes - leave.total$votes > SWING_MARGIN) {
    party.status <- "Solid remain"
  # Top parties are within the swing margin without any tactical votes
  } else if (abs(leave.top$votes - remain.top$votes) < SWING_MARGIN) {
    party.status <- "Swing"
    
    leave.ideal.case <- leave.top$party
    remain.ideal.case <- remain.top$party
  # Top parties are within the swing margin with tactical votes
  } else {
    party.status <- "Tactical swing"
    
    leave.ideal.case <- leave.top$party
    remain.ideal.case <- remain.top$party
  }
  
  # These columns will be added to the original row
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

# Analyze general election results to find swing votes
general.results <- general.results %>%
  by_row(AnalyzePartyVotes, .collate = "cols") %>%
  # Trim unnecessary column suffixes rom added columns
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

# Flag results that are known exactly (from BBC data)
brexit.results$leave.16.exact <- !is.na(brexit.results$leave.16.exact)

# Adjust to whole-number percents for consistency
brexit.results$leave.16 <- brexit.results$leave.16 * 100

#' Determine if a possible leave percentage is within the swing threshold.
#'
#' @param leave Percent that voted to leave.
#'
#' @return A text description of the swing status.
BrexitSwingStatus <- function(leave) {
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

# Compute Brexist swing status for all constituencies
brexit.results <- brexit.results %>%
  rowwise() %>%
  mutate(
    brexit.status = BrexitSwingStatus(leave.16)
  )

# Merge general election and brexit referendum results
merged.results <- general.results %>%
  left_join(brexit.results, by = "id")

#' Determine what, if anything, tactical votes should do in a given situation.
#'
#' @param brexit.status Text swing status of the referendum vote
#' @param party.status Text swing status of the general vote
#' @param tactical Best-case tactical vote
#'
#' @return The best-case tactical vote or NA if there is no practical vote
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

# Add practical votes to merged results
merged.results <- merged.results %>%
  rowwise() %>%
  mutate(
    leave.practical.case = PracticalCase(brexit.status, party.status, leave.top.party),
    remain.practical.case = PracticalCase(brexit.status, party.status, remain.top.party)
  )

# Write all results to CSV for review
write_csv(merged.results, "merged.results.csv")

# graphic <- merged.results
graphic <- merged.results %>%
  select(
    id, name,
    winner.party, party.status,
    leave.top.party, remain.top.party,
    leave.ideal.case, remain.ideal.case,
    leave.practical.case, remain.practical.case,
    leave.16
  )

# Write simplified CSV for charting/mapping
write_csv(graphic, "src/data/graphic.csv")
