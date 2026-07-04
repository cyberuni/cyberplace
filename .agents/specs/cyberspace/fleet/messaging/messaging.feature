Feature: messaging — send, read, and acknowledge mail between agents
  The cyberfleet CLI message layer over a file queue under project-scoped .cyberfleet/: send drops
  one collision-free, time-ordered file into the recipient's inbox; inbox lists a caller's mail;
  read prints a message and acks it by moving it out of the unread set. The file queue is the
  source of truth and does not depend on any running process. Identity and peer discovery live in
  identity; surfacing unread mail at session start lives in surfacing; the live send-nudge
  and watcher are deferred. Cross-capability e2e lives in acceptance.

  # ── Send drops one addressable file ──

  Scenario: send writes exactly one message file into the recipient's inbox
    Given a registered agent "alice" and a registered agent "bob"
    When alice runs cyberfleet send --to bob --body "ping"
    Then exactly one new file appears under .cyberfleet/inbox/<bob-id>/
    And that file records from=alice, to=bob, and body "ping"

  Scenario: a recipient can be addressed by handle or by id
    Given a registered agent "bob" with a known id
    When a peer sends addressing --to by bob's handle, and again --to by bob's id
    Then both messages land in bob's inbox

  Scenario: the body is taken from a flag, a file, or stdin
    Given a registered sender and recipient
    When the sender supplies the body via --body, via --body-file <path>, and via --body-file -
    Then each send writes a message whose body is the supplied content

  Scenario: sending to an unknown recipient fails without writing a partial file
    Given no agent is registered under the handle "ghost"
    When a sender runs cyberfleet send --to ghost --body "hi"
    Then the command errors and no message file is written

  # ── Collision-free, time-ordered names ──

  Scenario: message filenames sort chronologically
    Given two messages sent to the same recipient at different times
    When their inbox filenames are sorted lexically
    Then the order matches the order they were sent

  Scenario: two sends in the same millisecond do not clobber each other
    Given two messages written to the same inbox in the same millisecond
    When both files are on disk
    Then both messages are present, each under a distinct <epochMs>-<hex> filename

  # ── Inbox lists mail ──

  Scenario: inbox lists the caller's mail as chronological markdown
    Given the calling agent has three messages in its inbox
    When it runs cyberfleet inbox
    Then all three are listed oldest-first in markdown form

  Scenario: --unread lists only un-acked mail
    Given the calling agent has one acked and two un-acked messages
    When it runs cyberfleet inbox --unread
    Then only the two un-acked messages are listed

  Scenario: --from filters the inbox by sender
    Given the calling agent has mail from "alice" and from "carol"
    When it runs cyberfleet inbox --from alice
    Then only alice's messages are listed

  Scenario: an empty inbox reports no mail rather than erroring
    Given the calling agent has no messages
    When it runs cyberfleet inbox
    Then it reports an empty inbox rather than failing

  # ── Read prints and acks by move ──

  Scenario: read prints the body and moves the message to read/
    Given the calling agent has an unread message <msg-id>
    When it runs cyberfleet read <msg-id>
    Then the body is printed
    And the file moves from inbox/<me>/<msg-id>.json to inbox/<me>/read/<msg-id>.json

  Scenario: an acked message no longer appears in the unread set
    Given the calling agent has acked a message
    When it runs cyberfleet inbox --unread
    Then that message is not listed

  Scenario: read on an unknown or already-acked message errors rather than acking nothing
    Given a message id that is not in the calling agent's unread set
    When it runs cyberfleet read <msg-id>
    Then the command reports the message is not an unread message rather than silently succeeding

  # ── File queue is the source of truth ──

  Scenario: a message is durable whether or not the recipient is live
    Given the recipient agent's session is not running
    When a peer sends it a message
    Then the message file exists in the recipient's inbox
    And the recipient reads it the next time it runs cyberfleet inbox
