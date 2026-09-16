import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  AuthResponse,
  AuthUser,
  CompanyDto,
  LoginRequest,
  RegisterRequest
} from '@whosonsite/shared'
import { getAccessToken, setAccessToken } from '../../lib/api'
import { queryClient } from '../../app/query/client'
import * as authApi from '../../components/auth/api'

export interface AuthState {
  user: AuthUser | null
  company: CompanyDto | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  company: null,
  isAuthenticated: false,
  isLoading: true
}

export const bootstrapSessionThunk = createAsyncThunk<AuthResponse | null>(
  'auth/bootstrapSession',
  async (_, { rejectWithValue }) => {
    if (getAccessToken()) {
      return null
    }
    try {
      const res = await authApi.refreshApi()
      if (res.accessToken) {
        setAccessToken(res.accessToken)
      }
      return res
    } catch (err: unknown) {
      setAccessToken(null)
      queryClient.clear()
      return rejectWithValue(err instanceof Error ? err.message : 'Session restore failed')
    }
  }
)

export const loginThunk = createAsyncThunk<AuthResponse, LoginRequest>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await authApi.loginApi(credentials)
      if (res.accessToken) {
        setAccessToken(res.accessToken)
      }
      return res
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Login failed')
    }
  }
)

export const registerThunk = createAsyncThunk<AuthResponse, RegisterRequest>(
  'auth/register',
  async (data, { rejectWithValue }) => {
    try {
      const res = await authApi.registerApi(data)
      if (res.accessToken) {
        setAccessToken(res.accessToken)
      }
      return res
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Registration failed')
    }
  }
)

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logoutApi()
  } catch {
    // Ignore network errors on logout
  } finally {
    setAccessToken(null)
    queryClient.clear()
  }
})

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser; company?: CompanyDto }>) => {
      state.user = action.payload.user
      state.company = action.payload.company || null
      state.isAuthenticated = true
      state.isLoading = false
    },
    clearCredentials: (state) => {
      state.user = null
      state.company = null
      state.isAuthenticated = false
      state.isLoading = false
    }
  },
  extraReducers: (builder) => {
    // Bootstrap Session
    builder.addCase(bootstrapSessionThunk.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload.user
        state.company = action.payload.company || null
        state.isAuthenticated = true
      }
      state.isLoading = false
    })
    builder.addCase(bootstrapSessionThunk.rejected, (state) => {
      state.user = null
      state.company = null
      state.isAuthenticated = false
      state.isLoading = false
    })

    // Login
    builder.addCase(loginThunk.fulfilled, (state, action) => {
      state.user = action.payload.user
      state.company = action.payload.company || null
      state.isAuthenticated = true
      state.isLoading = false
    })

    // Register
    builder.addCase(registerThunk.fulfilled, (state, action) => {
      state.user = action.payload.user
      state.company = action.payload.company || null
      state.isAuthenticated = true
      state.isLoading = false
    })

    // Logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null
      state.company = null
      state.isAuthenticated = false
      state.isLoading = false
    })
  }
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
