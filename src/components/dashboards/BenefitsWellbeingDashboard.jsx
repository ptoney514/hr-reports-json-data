import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorBoundary from '../ui/ErrorBoundary';
import { 
  Heart,
  Shield,
  Users,
  DollarSign,
  Sparkles,
  Brain,
  TrendingUp,
  Award,
  ArrowRight,
  UserCheck,
  HeartHandshake,
  Target,
  Briefcase,
  Activity,
  Gift,
  BookOpen,
  Zap,
  Star,
  ArrowUpRight,
  Layers
} from 'lucide-react';

const BenefitsWellbeingDashboard = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Modern color palette
  const colors = {
    primary: '#1F74DB',
    softBlue: '#95D2F3', 
    warmGray: '#D7D2CB',
    green: '#71CC98',
    yellow: '#FFC72C',
    dark: '#00245D'
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen" style={{ backgroundColor: '#FAFBFC' }}>
        {/* Modern Minimal Header */}
        <div className="bg-white">
          <div className="px-8 py-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${colors.green}20` }}>
                  <Heart className="w-6 h-6" style={{ color: colors.green }} />
                </div>
                <span className="text-sm font-medium uppercase tracking-wider" style={{ color: colors.primary }}>
                  FY2025 Wins
                </span>
              </div>
              <h1 className="text-5xl font-light mb-4" style={{ color: colors.dark }}>
                Benefits & <span style={{ color: colors.green }}>Well-being</span>
              </h1>
              <p className="text-lg font-light" style={{ color: '#6B7280' }}>
                Transforming employee health, security, and quality of life
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-12 max-w-7xl mx-auto">
          {/* Hero Metric - Modern Asymmetric Layout */}
          <div className="grid grid-cols-12 gap-8 mb-16">
            <div className="col-span-5">
              <div className="bg-white rounded-3xl p-10 h-full flex flex-col justify-center relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full opacity-5"
                     style={{ backgroundColor: colors.primary }}></div>
                <span className="text-sm font-medium mb-3 block" style={{ color: colors.primary }}>
                  TOTAL COST OPTIMIZATION
                </span>
                <div className="text-6xl font-bold mb-4" style={{ color: colors.dark }}>
                  $3M
                </div>
                <p className="text-lg font-light" style={{ color: '#6B7280' }}>
                  Strategic savings achieved through negotiations and program optimization
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium"
                     style={{ color: colors.green }}>
                  <TrendingUp className="w-4 h-4" />
                  Since FY 2024-25
                </div>
              </div>
            </div>

            <div className="col-span-7">
              <div className="bg-white rounded-3xl p-10 h-full">
                <h3 className="text-xl font-medium mb-8" style={{ color: colors.dark }}>
                  Savings Breakdown
                </h3>
                <div className="space-y-6">
                  {[
                    { label: 'Medical Administration', value: 800, color: colors.primary },
                    { label: 'Pharmacy Contracting', value: 750, color: colors.softBlue },
                    { label: 'Policy Negotiations', value: 650, color: colors.green },
                    { label: 'Wellness Programs', value: 500, color: colors.yellow },
                    { label: 'UHC Credits Growth', value: 300, color: colors.warmGray }
                  ].map((item, index) => (
                    <div key={index} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-light" style={{ color: '#6B7280' }}>{item.label}</span>
                        <span className="font-semibold" style={{ color: colors.dark }}>${item.value}K</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                        <div 
                          className="h-full rounded-full transition-all duration-700 group-hover:opacity-80"
                          style={{ 
                            width: `${(item.value / 800) * 100}%`,
                            backgroundColor: item.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Key Achievements - Bento Box Layout */}
          <div className="grid grid-cols-12 gap-6 mb-16">
            {/* Navigate Partnership */}
            <div className="col-span-4">
              <div className="bg-white rounded-2xl p-8 h-full hover:shadow-lg transition-all cursor-pointer"
                   onMouseEnter={() => setHoveredCard('navigate')}
                   onMouseLeave={() => setHoveredCard(null)}>
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.green}15` }}>
                    <HeartHandshake className="w-6 h-6" style={{ color: colors.green }} />
                  </div>
                  {hoveredCard === 'navigate' && (
                    <ArrowUpRight className="w-5 h-5" style={{ color: colors.primary }} />
                  )}
                </div>
                <h3 className="text-2xl font-semibold mb-3" style={{ color: colors.dark }}>
                  Navigate Partnership
                </h3>
                <p className="font-light mb-4" style={{ color: '#6B7280' }}>
                  New well-being provider selected through comprehensive RFP for 2025
                </p>
                <div className="pt-4 border-t" style={{ borderColor: '#F3F4F6' }}>
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.green }}>
                    <Gift className="w-4 h-4" />
                    <span>Incentive framework reintroduced</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Resources Hub */}
            <div className="col-span-4">
              <div className="bg-white rounded-2xl p-8 h-full hover:shadow-lg transition-all cursor-pointer"
                   onMouseEnter={() => setHoveredCard('resources')}
                   onMouseLeave={() => setHoveredCard(null)}>
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                    <BookOpen className="w-6 h-6" style={{ color: colors.primary }} />
                  </div>
                  {hoveredCard === 'resources' && (
                    <ArrowUpRight className="w-5 h-5" style={{ color: colors.primary }} />
                  )}
                </div>
                <h3 className="text-2xl font-semibold mb-3" style={{ color: colors.dark }}>
                  Resource Hub
                </h3>
                <p className="font-light mb-4" style={{ color: '#6B7280' }}>
                  Centralized benefits guide created with campus partners
                </p>
                <div className="pt-4 border-t" style={{ borderColor: '#F3F4F6' }}>
                  <div className="flex items-center gap-2 text-sm" style={{ color: colors.primary }}>
                    <Users className="w-4 h-4" />
                    <span>All benefits & perks in one place</span>
                  </div>
                </div>
              </div>
            </div>

            {/* UHC Wellness Growth */}
            <div className="col-span-4">
              <div className="bg-gradient-to-br rounded-2xl p-8 h-full text-white relative overflow-hidden hover:shadow-lg transition-all"
                   style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.softBlue} 100%)` }}>
                <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-20 bg-white"></div>
                <div className="relative z-10">
                  <div className="mb-6">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">
                    UHC Wellness Credits
                  </h3>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-4xl font-bold">$150K</span>
                    <span className="text-sm opacity-90">per year</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="opacity-90">500% increase from 2023</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefit Enhancements - Modern Cards */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-8" style={{ color: colors.dark }}>
              Enhanced Benefits for 2025
            </h2>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Mental Health */}
              <div className="group">
                <div className="bg-white rounded-2xl p-8 h-full border-2 transition-all hover:shadow-lg"
                     style={{ borderColor: 'transparent' }}
                     onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.green}
                     onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.green}15` }}>
                      <Brain className="w-5 h-5" style={{ color: colors.green }} />
                    </div>
                    <span className="font-medium" style={{ color: colors.dark }}>Mental Health</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.green }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Expanded Magellan EAP</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.green }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>BetterHelp virtual therapy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.green }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Calm Health app access</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Voluntary Benefits */}
              <div className="group">
                <div className="bg-white rounded-2xl p-8 h-full border-2 transition-all hover:shadow-lg"
                     style={{ borderColor: 'transparent' }}
                     onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.primary}
                     onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.primary}15` }}>
                      <Shield className="w-5 h-5" style={{ color: colors.primary }} />
                    </div>
                    <span className="font-medium" style={{ color: colors.dark }}>Voluntary Benefits</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.primary }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Allstate Identity Protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.primary }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Accident coverage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.primary }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Critical illness & hospital</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Medicare Advocacy */}
              <div className="group">
                <div className="bg-white rounded-2xl p-8 h-full border-2 transition-all hover:shadow-lg"
                     style={{ borderColor: 'transparent' }}
                     onMouseEnter={(e) => e.currentTarget.style.borderColor = colors.yellow}
                     onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.yellow}20` }}>
                      <UserCheck className="w-5 h-5" style={{ color: colors.yellow }} />
                    </div>
                    <span className="font-medium" style={{ color: colors.dark }}>Medicare Support</span>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.yellow }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>SmartConnect partnership</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.yellow }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Personalized guidance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: colors.yellow }}></div>
                      <span className="text-sm" style={{ color: '#6B7280' }}>Free educational resources</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Communication Enhancement - Full Width Card */}
          <div className="mb-16">
            <div className="rounded-3xl p-10 relative overflow-hidden"
                 style={{ background: `linear-gradient(135deg, ${colors.warmGray}20 0%, white 100%)` }}>
              <div className="grid grid-cols-12 gap-8 items-center">
                <div className="col-span-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="w-6 h-6" style={{ color: colors.primary }} />
                    <span className="text-sm font-medium uppercase tracking-wider" style={{ color: colors.primary }}>
                      RETIREMENT PLANNING
                    </span>
                  </div>
                  <h3 className="text-3xl font-semibold mb-4" style={{ color: colors.dark }}>
                    Enhanced Communication Strategy
                  </h3>
                  <p className="text-lg font-light" style={{ color: '#6B7280' }}>
                    Strengthening communication efforts with The Retirement Plan of Creighton.
                    Projection statements sent to targeted audiences to drive education and participation.
                  </p>
                </div>
                <div className="col-span-4 text-center">
                  <div className="inline-flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
                         style={{ backgroundColor: colors.softBlue }}>
                      <TrendingUp className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-sm font-medium" style={{ color: colors.primary }}>
                      Driving Engagement
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats - Modern Minimal */}
          <div className="grid grid-cols-4 gap-4 mb-12">
            {[
              { icon: Heart, label: 'Navigate Partner', value: 'New 2025', color: colors.green },
              { icon: DollarSign, label: 'Cost Savings', value: '$3M', color: colors.primary },
              { icon: Brain, label: 'Mental Health Tools', value: '3', color: colors.softBlue },
              { icon: Shield, label: 'New Benefits', value: '4', color: colors.yellow }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex flex-col items-center">
                  <stat.icon className="w-8 h-8 mb-3" style={{ color: stat.color }} />
                  <div className="text-2xl font-bold mb-1" style={{ color: colors.dark }}>{stat.value}</div>
                  <div className="text-xs font-light" style={{ color: '#6B7280' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div className="flex justify-between items-center mt-16 pt-8 border-t" style={{ borderColor: '#E5E7EB' }}>
            <Link to="/dashboards" className="flex items-center gap-2 font-medium transition-colors"
                  style={{ color: colors.primary }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.dark}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.primary}>
              <span className="mr-1">←</span> Dashboard Home
            </Link>
            <div className="text-sm font-light" style={{ color: '#9CA3AF' }}>
              HR Benefits & Well-being • FY2025
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default BenefitsWellbeingDashboard;