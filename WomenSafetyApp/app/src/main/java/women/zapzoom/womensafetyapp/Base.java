package women.zapzoom.womensafetyapp;

import android.app.Activity;
import android.os.Bundle;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.Scopes;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.plus.Plus;

/**
 * Created by sneha on 12/9/15.
 */
public class Base extends Activity implements  GoogleApiClient.ConnectionCallbacks,
        GoogleApiClient.OnConnectionFailedListener {


    /* Request code used to invoke sign in user interactions. */
    protected static final int RC_SIGN_IN = 0;

    /* Client used to interact with Google APIs. */
    protected GoogleApiClient mGoogleApiClient;
    /* Is there a ConnectionResult resolution in progress? */
    protected boolean mIsResolving = false;

    /* Should we automatically resolve ConnectionResults when possible? */
    protected boolean mShouldResolve = false;


    @Override
    public void onCreate(Bundle saveinstance) {

        super.onCreate(saveinstance);
        // Build GoogleApiClient with access to basic profile
        mGoogleApiClient = new GoogleApiClient.Builder(this)
                .addConnectionCallbacks(this)
                .addOnConnectionFailedListener(this)
                .addApi(Plus.API)
                .addScope(new Scope(Scopes.PROFILE))
                .build();
    }

    @Override
    public void onConnected(Bundle bundle) {
// onConnected indicates that an account was selected on the device, that the selected
        // account has granted any requested permissions to our app and that we were able to
        // establish a service connection to Google Play services.
       }


    @Override
    public void onConnectionSuspended(int i) {

    }


    @Override
    public void onConnectionFailed(ConnectionResult connectionResult) {}


    @Override
    protected void onStart() {
        super.onStart();
        mGoogleApiClient.connect();
    }

    @Override
    protected void onStop() {
        super.onStop();
        mGoogleApiClient.disconnect();
    }
}
