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
  supabaseUrl: "",
  supabaseAnonKey: ""
};
