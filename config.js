/* Vul hier de twee waarden in die je bij Supabase vindt onder
 * Project Settings -> API. Zolang ze leeg zijn werkt de agenda
 * gewoon, maar alleen op dit ene toestel.
 *
 * De anon key hoort publiek te zijn. Hij geeft op zichzelf geen
 * toegang tot gegevens: de regels in setup.sql zorgen ervoor dat
 * iedereen alleen zijn eigen rijen ziet. Zet hier NOOIT de
 * service_role key neer.
 */
window.PLANNER_CONFIG = {
  supabaseUrl: "https://bfpdjkkhsdwkvqkzeaqn.supabase.co/rest/v1/",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmcGRqa2toc2R3a3Zxa3plYXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3Mjg1MjIsImV4cCI6MjEwNTMwNDUyMn0.frMuOaWOPuvWBWW2TfxjxDRpf9gj4_TbX86HgfSFl4k"
};
